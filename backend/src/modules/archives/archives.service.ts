import { HttpStatus, Injectable } from '@nestjs/common';
import { ArchiveRecordStatus, FinalResultStatus, ResultPublicationStatus, RevisionRequestStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RecordLockService } from '../record-lock/record-lock.service';
import { ApproveArchiveRecordDto } from './dto/approve-archive-record.dto';
import { CompleteArchiveRecordDto } from './dto/complete-archive-record.dto';
import { CreateArchiveRecordDto } from './dto/create-archive-record.dto';
import { QueryArchiveRecordDto } from './dto/query-archive-record.dto';
import { RequestArchiveSupplementDto } from './dto/request-archive-supplement.dto';
import { ResubmitArchiveRecordDto } from './dto/resubmit-archive-record.dto';

@Injectable()
export class ArchivesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly recordLockService: RecordLockService,
  ) {}

  async findAll(query: QueryArchiveRecordDto) {
    return this.prisma.archiveRecord.findMany({
      where: { status: query.status, projectPeriodId: query.projectPeriodId },
      include: this.include(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMe(actor: AuthUser) {
    const student = await this.getStudent(actor);
    return this.prisma.archiveRecord.findMany({ where: { studentId: student.id }, include: this.include(), orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, actor: AuthUser) {
    const archive = await this.prisma.archiveRecord.findUnique({ where: { id }, include: this.include() });
    if (!archive) throw new AppException('ARCHIVE_RECORD_NOT_FOUND', 'Không tìm thấy hồ sơ lưu trữ', HttpStatus.NOT_FOUND);
    if (actor.roles.some((role) => ['ADMIN', 'FACULTY_MANAGER', 'ARCHIVE_STAFF'].includes(role)) || archive.student.userId === actor.id) return archive;
    throw new AppException('ARCHIVE_NOT_ALLOWED', 'Bạn không có quyền xem hồ sơ lưu trữ này', HttpStatus.FORBIDDEN);
  }

  async create(dto: CreateArchiveRecordDto, actor: AuthUser) {
    const student = await this.getStudent(actor);
    const result = dto.finalResultId
      ? await this.prisma.finalResult.findUnique({ where: { id: dto.finalResultId }, include: { revisionRequest: true } })
      : await this.prisma.finalResult.findFirst({ where: { studentId: student.id, publicationStatus: ResultPublicationStatus.PUBLISHED }, include: { revisionRequest: true }, orderBy: { publishedAt: 'desc' } });
    if (!result || result.studentId !== student.id) throw new AppException('FINAL_RESULT_NOT_FOUND', 'Không tìm thấy kết quả hợp lệ để lưu trữ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(result.studentId, result.projectPeriodId);
    if (result.resultStatus === FinalResultStatus.FAILED) throw new AppException('ARCHIVE_NOT_ALLOWED', 'Sinh viên không đạt không được nộp hồ sơ lưu trữ đạt', HttpStatus.BAD_REQUEST);
    if (result.resultStatus === FinalResultStatus.PASSED_WITH_REVISION) {
      if (!result.revisionRequest || result.revisionRequest.status !== RevisionRequestStatus.APPROVED) {
        throw new AppException('ARCHIVE_NOT_ALLOWED', 'Cần hoàn tất chỉnh sửa trước khi nộp lưu trữ', HttpStatus.BAD_REQUEST);
      }
    }
    if (!dto.finalReportFileId) throw new AppException('ARCHIVE_REQUIRED_FILE_MISSING', 'Cần nộp báo cáo chính thức', HttpStatus.BAD_REQUEST);
    const existing = await this.prisma.archiveRecord.findUnique({ where: { finalResultId: result.id } });
    if (existing && existing.status !== ArchiveRecordStatus.NEEDS_SUPPLEMENT && existing.status !== ArchiveRecordStatus.NOT_SUBMITTED) {
      throw new AppException('ARCHIVE_RECORD_EXISTS', 'Hồ sơ lưu trữ đã tồn tại', HttpStatus.CONFLICT);
    }
    const archive = existing
      ? await this.prisma.archiveRecord.update({ where: { id: existing.id }, data: this.archiveFileData(dto, ArchiveRecordStatus.SUBMITTED), include: this.include() })
      : await this.prisma.archiveRecord.create({
          data: {
            finalResultId: result.id,
            defenseRegistrationId: result.defenseRegistrationId,
            studentId: result.studentId,
            projectPeriodId: result.projectPeriodId,
            revisionRequestId: result.revisionRequest?.id,
            ...this.archiveFileData(dto, ArchiveRecordStatus.SUBMITTED),
          },
          include: this.include(),
        });
    await this.audit(actor, 'ARCHIVE_RECORD_CREATED', archive.id);
    return archive;
  }

  async resubmit(id: string, dto: ResubmitArchiveRecordDto, actor: AuthUser) {
    const archive = await this.prisma.archiveRecord.findUnique({ where: { id }, include: { student: true } });
    if (!archive) throw new AppException('ARCHIVE_RECORD_NOT_FOUND', 'Không tìm thấy hồ sơ lưu trữ', HttpStatus.NOT_FOUND);
    if (archive.student.userId !== actor.id) throw new AppException('ARCHIVE_NOT_ALLOWED', 'Bạn chỉ được bổ sung hồ sơ của mình', HttpStatus.FORBIDDEN);
    await this.recordLockService.checkProjectRecordLocked(archive.studentId, archive.projectPeriodId);
    if (archive.status !== ArchiveRecordStatus.NEEDS_SUPPLEMENT) throw new AppException('ARCHIVE_INVALID_STATUS', 'Chỉ bổ sung khi hồ sơ bị yêu cầu bổ sung', HttpStatus.BAD_REQUEST);
    const updated = await this.prisma.archiveRecord.update({ where: { id }, data: this.archiveFileData(dto, ArchiveRecordStatus.SUBMITTED), include: this.include() });
    await this.audit(actor, 'ARCHIVE_RECORD_RESUBMITTED', id);
    return updated;
  }

  async requestSupplement(id: string, dto: RequestArchiveSupplementDto, actor: AuthUser) {
    if (!dto.supplementReason?.trim()) throw new AppException('ARCHIVE_SUPPLEMENT_REASON_REQUIRED', 'Cần nhập lý do bổ sung', HttpStatus.BAD_REQUEST);
    const archive = await this.prisma.archiveRecord.findUnique({ where: { id }, include: { student: { include: { user: true } } } });
    if (!archive) throw new AppException('ARCHIVE_RECORD_NOT_FOUND', 'Không tìm thấy hồ sơ lưu trữ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(archive.studentId, archive.projectPeriodId);
    if (archive.status === ArchiveRecordStatus.LOCKED) throw new AppException('PROJECT_RECORD_LOCKED', 'Hồ sơ đã khóa', HttpStatus.CONFLICT);
    const updated = await this.prisma.archiveRecord.update({ where: { id }, data: { status: ArchiveRecordStatus.NEEDS_SUPPLEMENT, supplementReason: dto.supplementReason, archiveStaffId: actor.id }, include: this.include() });
    await this.notificationsService.create({ userId: archive.student.userId, title: 'Cần bổ sung hồ sơ lưu trữ', message: dto.supplementReason, type: 'ARCHIVE_SUPPLEMENT_REQUESTED' });
    await this.audit(actor, 'ARCHIVE_SUPPLEMENT_REQUESTED', id);
    return updated;
  }

  async approve(id: string, dto: ApproveArchiveRecordDto, actor: AuthUser) {
    const archive = await this.prisma.archiveRecord.findUnique({ where: { id }, include: { student: { include: { user: true } } } });
    if (!archive) throw new AppException('ARCHIVE_RECORD_NOT_FOUND', 'Không tìm thấy hồ sơ lưu trữ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(archive.studentId, archive.projectPeriodId);
    if (archive.status !== ArchiveRecordStatus.SUBMITTED) throw new AppException('ARCHIVE_INVALID_STATUS', 'Chỉ duyệt hồ sơ đã nộp', HttpStatus.BAD_REQUEST);
    const updated = await this.prisma.archiveRecord.update({ where: { id }, data: { status: ArchiveRecordStatus.APPROVED, archiveStaffId: actor.id, archiveNote: dto.archiveNote, approvedAt: new Date() }, include: this.include() });
    await this.notificationsService.create({ userId: archive.student.userId, title: 'Hồ sơ lưu trữ đã hợp lệ', message: 'Hồ sơ lưu trữ của bạn đã được xác nhận hợp lệ.', type: 'ARCHIVE_APPROVED' });
    await this.audit(actor, 'ARCHIVE_RECORD_APPROVED', id);
    return updated;
  }

  async complete(id: string, dto: CompleteArchiveRecordDto, actor: AuthUser) {
    const archive = await this.prisma.archiveRecord.findUnique({ where: { id }, include: { student: { include: { user: true } } } });
    if (!archive) throw new AppException('ARCHIVE_RECORD_NOT_FOUND', 'Không tìm thấy hồ sơ lưu trữ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(archive.studentId, archive.projectPeriodId);
    if (archive.status !== ArchiveRecordStatus.APPROVED) throw new AppException('ARCHIVE_INVALID_STATUS', 'Chỉ hoàn tất hồ sơ đã được duyệt', HttpStatus.BAD_REQUEST);
    const updated = await this.prisma.archiveRecord.update({ where: { id }, data: { status: ArchiveRecordStatus.COMPLETED, archiveStaffId: actor.id, archiveNote: dto.archiveNote ?? archive.archiveNote, completedAt: new Date() }, include: this.include() });
    await this.notificationsService.create({ userId: archive.student.userId, title: 'Hồ sơ lưu trữ đã hoàn tất', message: 'Hồ sơ của bạn đã được bàn giao/lưu trữ.', type: 'ARCHIVE_COMPLETED' });
    await this.audit(actor, 'ARCHIVE_RECORD_COMPLETED', id);
    return updated;
  }

  async lock(id: string, actor: AuthUser) {
    const archive = await this.prisma.archiveRecord.findUnique({ where: { id }, include: { student: { include: { user: true } } } });
    if (!archive) throw new AppException('ARCHIVE_RECORD_NOT_FOUND', 'Không tìm thấy hồ sơ lưu trữ', HttpStatus.NOT_FOUND);
    if (archive.status !== ArchiveRecordStatus.COMPLETED) throw new AppException('PROJECT_RECORD_NOT_READY_TO_LOCK', 'Chỉ khóa hồ sơ đã hoàn tất lưu trữ', HttpStatus.BAD_REQUEST);
    const updated = await this.prisma.archiveRecord.update({ where: { id }, data: { status: ArchiveRecordStatus.LOCKED, lockedAt: new Date(), archiveStaffId: actor.id }, include: this.include() });
    await this.prisma.projectRecordLock.upsert({
      where: { studentId_projectPeriodId: { studentId: archive.studentId, projectPeriodId: archive.projectPeriodId } },
      update: { archiveRecordId: archive.id, finalResultId: archive.finalResultId, lockedById: actor.id, reason: 'Hoàn tất lưu trữ hồ sơ đồ án', lockedAt: new Date() },
      create: { studentId: archive.studentId, projectPeriodId: archive.projectPeriodId, archiveRecordId: archive.id, finalResultId: archive.finalResultId, lockedById: actor.id, reason: 'Hoàn tất lưu trữ hồ sơ đồ án' },
    });
    await this.notificationsService.create({ userId: archive.student.userId, title: 'Hồ sơ đã khóa', message: 'Hồ sơ đồ án đã hoàn tất lưu trữ và chỉ còn tra cứu.', type: 'RECORD_LOCKED' });
    await this.audit(actor, 'PROJECT_RECORD_LOCKED', id);
    return updated;
  }

  private archiveFileData(dto: CreateArchiveRecordDto | ResubmitArchiveRecordDto, status: ArchiveRecordStatus) {
    return { finalReportFileId: dto.finalReportFileId, finalSlideFileId: dto.finalSlideFileId, sourceCodeFileId: dto.sourceCodeFileId, additionalDocumentFileId: dto.additionalDocumentFileId, archiveNote: dto.archiveNote, supplementReason: null, status, submittedAt: new Date() };
  }

  private include() {
    return { student: { include: { user: true } }, finalResult: true, revisionRequest: true, finalReportFile: true, finalSlideFile: true, sourceCodeFile: true, additionalDocumentFile: true };
  }

  private async getStudent(actor: AuthUser) {
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    return student;
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType: 'ArchiveRecord', targetId, result: 'SUCCESS' });
  }
}
