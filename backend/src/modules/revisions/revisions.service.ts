import { HttpStatus, Injectable } from '@nestjs/common';
import { FinalResultStatus, RevisionRequestStatus, RevisionSubmissionStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RecordLockService } from '../record-lock/record-lock.service';
import { ApproveRevisionDto } from './dto/approve-revision.dto';
import { CreateRevisionRequestDto } from './dto/create-revision-request.dto';
import { CreateRevisionSubmissionDto } from './dto/create-revision-submission.dto';
import { QueryRevisionDto } from './dto/query-revision.dto';
import { RequestRevisionChangesDto } from './dto/request-revision-changes.dto';

@Injectable()
export class RevisionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly recordLockService: RecordLockService,
  ) {}

  async findAll(query: QueryRevisionDto) {
    return this.prisma.revisionRequest.findMany({
      where: { status: query.status, projectPeriodId: query.projectPeriodId },
      include: this.include(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMe(actor: AuthUser) {
    const student = await this.getStudent(actor);
    return this.prisma.revisionRequest.findMany({
      where: { studentId: student.id },
      include: this.include(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const revision = await this.prisma.revisionRequest.findUnique({ where: { id }, include: this.include() });
    if (!revision) throw new AppException('REVISION_REQUEST_NOT_FOUND', 'Không tìm thấy yêu cầu chỉnh sửa', HttpStatus.NOT_FOUND);
    await this.assertCanView(revision, actor);
    return revision;
  }

  async create(dto: CreateRevisionRequestDto, actor: AuthUser) {
    const result = await this.prisma.finalResult.findUnique({ where: { id: dto.finalResultId }, include: { student: { include: { user: true } }, defenseRegistration: true, defenseSchedule: true } });
    if (!result) throw new AppException('FINAL_RESULT_NOT_FOUND', 'Không tìm thấy kết quả bảo vệ', HttpStatus.NOT_FOUND);
    if (result.resultStatus !== FinalResultStatus.PASSED_WITH_REVISION) {
      throw new AppException('REVISION_NOT_ALLOWED', 'Chỉ tạo yêu cầu chỉnh sửa cho kết quả đạt nhưng cần chỉnh sửa', HttpStatus.BAD_REQUEST);
    }
    await this.recordLockService.checkProjectRecordLocked(result.studentId, result.projectPeriodId);
    const existing = await this.prisma.revisionRequest.findUnique({ where: { finalResultId: result.id } });
    if (existing) throw new AppException('REVISION_REQUEST_EXISTS', 'Yêu cầu chỉnh sửa đã tồn tại', HttpStatus.CONFLICT);

    const revision = await this.prisma.revisionRequest.create({
      data: {
        finalResultId: result.id,
        defenseRegistrationId: result.defenseRegistrationId,
        defenseScheduleId: result.defenseScheduleId,
        studentId: result.studentId,
        projectPeriodId: result.projectPeriodId,
        requestedById: actor.id,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: RevisionRequestStatus.PENDING_SUBMISSION,
      },
      include: this.include(),
    });
    await this.notificationsService.create({ userId: result.student.userId, title: 'Yêu cầu chỉnh sửa sau bảo vệ', message: dto.description, type: 'REVISION_REQUEST_CREATED' });
    await this.audit(actor, 'REVISION_REQUEST_CREATED', revision.id);
    return revision;
  }

  async createSubmission(id: string, dto: CreateRevisionSubmissionDto, actor: AuthUser) {
    const student = await this.getStudent(actor);
    const revision = await this.prisma.revisionRequest.findUnique({ where: { id }, include: { finalResult: true } });
    if (!revision) throw new AppException('REVISION_REQUEST_NOT_FOUND', 'Không tìm thấy yêu cầu chỉnh sửa', HttpStatus.NOT_FOUND);
    if (revision.studentId !== student.id) throw new AppException('REVISION_NOT_ALLOWED', 'Bạn chỉ được nộp bản chỉnh sửa của mình', HttpStatus.FORBIDDEN);
    await this.recordLockService.checkProjectRecordLocked(revision.studentId, revision.projectPeriodId);
    const submittableStatuses: RevisionRequestStatus[] = [RevisionRequestStatus.PENDING_SUBMISSION, RevisionRequestStatus.NEEDS_CHANGES];
    if (!submittableStatuses.includes(revision.status)) {
      throw new AppException('REVISION_INVALID_STATUS', 'Trạng thái yêu cầu chỉnh sửa không cho phép nộp bản mới', HttpStatus.BAD_REQUEST);
    }
    if (!dto.reportFileId) throw new AppException('REVISION_FILE_REQUIRED', 'Cần chọn file bản chỉnh sửa', HttpStatus.BAD_REQUEST);
    const last = await this.prisma.revisionSubmission.findFirst({ where: { revisionRequestId: id }, orderBy: { versionNumber: 'desc' } });
    const submission = await this.prisma.revisionSubmission.create({
      data: { revisionRequestId: id, studentId: student.id, versionNumber: (last?.versionNumber ?? 0) + 1, reportFileId: dto.reportFileId, note: dto.note, status: RevisionSubmissionStatus.SUBMITTED },
    });
    await this.prisma.revisionRequest.update({ where: { id }, data: { status: RevisionRequestStatus.SUBMITTED } });
    await this.audit(actor, 'REVISION_SUBMISSION_CREATED', submission.id);
    return submission;
  }

  async submissions(id: string, actor: AuthUser) {
    const revision = await this.findOne(id, actor);
    return revision.submissions;
  }

  async approve(id: string, dto: ApproveRevisionDto, actor: AuthUser) {
    const revision = await this.prisma.revisionRequest.findUnique({ where: { id }, include: { student: { include: { user: true } } } });
    if (!revision) throw new AppException('REVISION_REQUEST_NOT_FOUND', 'Không tìm thấy yêu cầu chỉnh sửa', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(revision.studentId, revision.projectPeriodId);
    const reviewableStatuses: RevisionRequestStatus[] = [RevisionRequestStatus.SUBMITTED, RevisionRequestStatus.NEEDS_CHANGES];
    if (!reviewableStatuses.includes(revision.status)) {
      throw new AppException('REVISION_INVALID_STATUS', 'Chỉ duyệt bản chỉnh sửa đã được nộp', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.prisma.revisionRequest.update({ where: { id }, data: { status: RevisionRequestStatus.APPROVED, approvedById: actor.id, approvedAt: new Date(), feedback: dto.feedback }, include: this.include() });
    await this.notificationsService.create({ userId: revision.student.userId, title: 'Bản chỉnh sửa đã được duyệt', message: 'Hồ sơ của bạn đã sẵn sàng chuyển sang lưu trữ.', type: 'REVISION_APPROVED' });
    await this.audit(actor, 'REVISION_APPROVED', id);
    return updated;
  }

  async requestChanges(id: string, dto: RequestRevisionChangesDto, actor: AuthUser) {
    if (!dto.feedback?.trim()) throw new AppException('REVISION_FEEDBACK_REQUIRED', 'Cần nhập feedback chỉnh sửa', HttpStatus.BAD_REQUEST);
    const revision = await this.prisma.revisionRequest.findUnique({ where: { id }, include: { student: { include: { user: true } } } });
    if (!revision) throw new AppException('REVISION_REQUEST_NOT_FOUND', 'Không tìm thấy yêu cầu chỉnh sửa', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(revision.studentId, revision.projectPeriodId);
    if (revision.status !== RevisionRequestStatus.SUBMITTED) {
      throw new AppException('REVISION_INVALID_STATUS', 'Chỉ yêu cầu sửa lại khi sinh viên đã nộp bản chỉnh sửa', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.prisma.revisionRequest.update({ where: { id }, data: { status: RevisionRequestStatus.NEEDS_CHANGES, feedback: dto.feedback }, include: this.include() });
    await this.notificationsService.create({ userId: revision.student.userId, title: 'Cần chỉnh sửa lại sau bảo vệ', message: dto.feedback, type: 'REVISION_CHANGES_REQUESTED' });
    await this.audit(actor, 'REVISION_CHANGES_REQUESTED', id);
    return updated;
  }

  private include() {
    return { student: { include: { user: true } }, finalResult: true, submissions: { include: { reportFile: true }, orderBy: { versionNumber: 'desc' as const } } };
  }

  private async getStudent(actor: AuthUser) {
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    return student;
  }

  private async assertCanView(revision: any, actor: AuthUser) {
    if (actor.roles.some((role) => ['ADMIN', 'FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'SUPERVISOR'].includes(role))) return;
    if (revision.student?.userId === actor.id) return;
    throw new AppException('REVISION_NOT_ALLOWED', 'Bạn không có quyền xem yêu cầu chỉnh sửa này', HttpStatus.FORBIDDEN);
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType: 'RevisionRequest', targetId, result: 'SUCCESS' });
  }
}
