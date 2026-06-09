import { HttpStatus, Injectable } from '@nestjs/common';
import { OutlineStatus, SupervisorAssignmentStatus, TopicRegistrationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOutlineDto } from './dto/create-outline.dto';
import { QueryOutlineDto } from './dto/query-outline.dto';
import { RequestOutlineRevisionDto } from './dto/request-outline-revision.dto';
import { ResubmitOutlineDto } from './dto/resubmit-outline.dto';

@Injectable()
export class OutlinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly filesService: FilesService,
  ) {}

  async findMe(actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    return this.prisma.outline.findFirst({
      where: { studentId: student.id },
      include: this.outlineInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSupervisor(actor: AuthUser, query: QueryOutlineDto = {}) {
    const lecturer = await this.getLecturerByUserId(actor.id);
    return this.prisma.outline.findMany({
      where: {
        supervisorId: lecturer.id,
        status: query.status,
        projectPeriodId: query.projectPeriodId,
      },
      include: this.outlineInclude(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAll(query: QueryOutlineDto = {}) {
    return this.prisma.outline.findMany({
      where: { status: query.status, projectPeriodId: query.projectPeriodId },
      include: this.outlineInclude(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const outline = await this.getOutlineOrThrow(id);
    await this.ensureCanView(outline, actor);
    return outline;
  }

  async getHistory(id: string, actor: AuthUser) {
    const outline = await this.findOne(id, actor);
    return outline.versions;
  }

  async create(dto: CreateOutlineDto, actor: AuthUser) {
    const assignment = await this.getCurrentStudentAssignment(actor.id);

    if (assignment.topicRegistration.status !== TopicRegistrationStatus.OFFICIALLY_ASSIGNED) {
      throw new AppException('STUDENT_NOT_ASSIGNED', 'Sinh viên chưa được xác nhận đề tài và GVHD chính thức', HttpStatus.CONFLICT);
    }

    const existing = await this.prisma.outline.findUnique({ where: { topicRegistrationId: assignment.topicRegistrationId } });
    if (existing) {
      throw new AppException('OUTLINE_INVALID_STATUS', 'Đề cương đã tồn tại, hãy dùng chức năng nộp lại nếu được yêu cầu chỉnh sửa', HttpStatus.CONFLICT);
    }

    if (dto.fileDocumentId) {
      await this.filesService.ensureCanAccess(dto.fileDocumentId, actor);
    }

    const outline = await this.prisma.outline.create({
      data: {
        topicRegistrationId: assignment.topicRegistrationId,
        supervisorAssignmentId: assignment.id,
        studentId: assignment.studentId,
        supervisorId: assignment.supervisorId,
        projectPeriodId: assignment.projectPeriodId,
        title: dto.title.trim(),
        summary: dto.summary.trim(),
        objectives: dto.objectives,
        methodology: dto.methodology,
        expectedOutput: dto.expectedOutput,
        timeline: dto.timeline,
        status: OutlineStatus.SUBMITTED,
        currentVersion: 1,
        versions: {
          create: {
            versionNumber: 1,
            title: dto.title.trim(),
            summary: dto.summary.trim(),
            objectives: dto.objectives,
            methodology: dto.methodology,
            expectedOutput: dto.expectedOutput,
            timeline: dto.timeline,
            fileDocumentId: dto.fileDocumentId,
            submitNote: dto.submitNote,
          },
        },
      },
      include: this.outlineInclude(),
    });

    const version = outline.versions.find((item) => item.versionNumber === 1);
    await this.filesService.markRelated(dto.fileDocumentId, 'OUTLINE_VERSION', version?.id ?? outline.id);
    await this.audit(actor, 'OUTLINE_SUBMITTED', outline.id);
    await this.notificationsService.create({
      userId: assignment.supervisor.userId,
      title: 'Sinh viên nộp đề cương',
      message: `${actor.fullName} đã nộp đề cương mới chờ bạn phản hồi.`,
      type: 'OUTLINE_SUBMITTED',
    });

    return outline;
  }

  async resubmit(id: string, dto: ResubmitOutlineDto, actor: AuthUser) {
    const outline = await this.getOutlineOrThrow(id);
    const student = await this.getStudentByUserId(actor.id);

    if (outline.studentId !== student.id) {
      throw new AppException('OUTLINE_NOT_FOUND', 'Không tìm thấy đề cương của bạn', HttpStatus.NOT_FOUND);
    }
    if (outline.status === OutlineStatus.APPROVED) {
      throw new AppException('OUTLINE_ALREADY_APPROVED', 'Đề cương đã được duyệt, không thể nộp lại', HttpStatus.CONFLICT);
    }
    if (outline.status !== OutlineStatus.NEEDS_REVISION) {
      throw new AppException('OUTLINE_INVALID_STATUS', 'Chỉ được nộp lại khi GVHD yêu cầu chỉnh sửa', HttpStatus.CONFLICT);
    }

    if (dto.fileDocumentId) {
      await this.filesService.ensureCanAccess(dto.fileDocumentId, actor);
    }

    const nextVersion = outline.currentVersion + 1;
    const updated = await this.prisma.outline.update({
      where: { id },
      data: {
        title: dto.title.trim(),
        summary: dto.summary.trim(),
        objectives: dto.objectives,
        methodology: dto.methodology,
        expectedOutput: dto.expectedOutput,
        timeline: dto.timeline,
        status: OutlineStatus.SUBMITTED,
        currentVersion: nextVersion,
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedById: null,
        feedback: null,
        versions: {
          create: {
            versionNumber: nextVersion,
            title: dto.title.trim(),
            summary: dto.summary.trim(),
            objectives: dto.objectives,
            methodology: dto.methodology,
            expectedOutput: dto.expectedOutput,
            timeline: dto.timeline,
            fileDocumentId: dto.fileDocumentId,
            submitNote: dto.submitNote,
          },
        },
      },
      include: this.outlineInclude(),
    });

    const version = updated.versions.find((item) => item.versionNumber === nextVersion);
    await this.filesService.markRelated(dto.fileDocumentId, 'OUTLINE_VERSION', version?.id ?? updated.id);
    await this.audit(actor, 'OUTLINE_RESUBMITTED', id);
    await this.notificationsService.create({
      userId: outline.supervisor.userId,
      title: 'Sinh viên nộp lại đề cương',
      message: `${actor.fullName} đã nộp lại đề cương sau khi chỉnh sửa.`,
      type: 'OUTLINE_RESUBMITTED',
    });

    return updated;
  }

  async approve(id: string, actor: AuthUser) {
    const outline = await this.ensureSupervisorOwnsOutline(id, actor);
    if (outline.status === OutlineStatus.APPROVED) {
      throw new AppException('OUTLINE_ALREADY_APPROVED', 'Đề cương đã được duyệt', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.outline.update({
      where: { id },
      data: {
        status: OutlineStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedById: actor.id,
        feedback: null,
      },
      include: this.outlineInclude(),
    });

    await this.audit(actor, 'OUTLINE_APPROVED', id);
    await this.notificationsService.create({
      userId: outline.student.userId,
      title: 'Đề cương đã được duyệt',
      message: 'GVHD đã duyệt đề cương. Bạn có thể cập nhật tiến độ đồ án.',
      type: 'OUTLINE_APPROVED',
    });

    return updated;
  }

  async requestRevision(id: string, dto: RequestOutlineRevisionDto, actor: AuthUser) {
    const outline = await this.ensureSupervisorOwnsOutline(id, actor);
    if (!dto.feedback?.trim()) {
      throw new AppException('OUTLINE_FEEDBACK_REQUIRED', 'Feedback là bắt buộc khi yêu cầu chỉnh sửa', HttpStatus.BAD_REQUEST);
    }
    if (outline.status === OutlineStatus.APPROVED) {
      throw new AppException('OUTLINE_ALREADY_APPROVED', 'Không thể yêu cầu sửa đề cương đã duyệt', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.outline.update({
      where: { id },
      data: {
        status: OutlineStatus.NEEDS_REVISION,
        feedback: dto.feedback.trim(),
        reviewedAt: new Date(),
        reviewedById: actor.id,
      },
      include: this.outlineInclude(),
    });

    await this.audit(actor, 'OUTLINE_REVISION_REQUESTED', id);
    await this.notificationsService.create({
      userId: outline.student.userId,
      title: 'GVHD yêu cầu chỉnh sửa đề cương',
      message: dto.feedback.trim(),
      type: 'OUTLINE_REVISION_REQUESTED',
    });

    return updated;
  }

  private async getCurrentStudentAssignment(userId: string) {
    const student = await this.getStudentByUserId(userId);
    const assignment = await this.prisma.supervisorAssignment.findFirst({
      where: { studentId: student.id, status: SupervisorAssignmentStatus.ACTIVE },
      include: { topicRegistration: true, supervisor: { include: { user: true } }, student: { include: { user: true } }, topic: true, projectPeriod: true },
      orderBy: { assignedAt: 'desc' },
    });

    if (!assignment) {
      throw new AppException('SUPERVISOR_ASSIGNMENT_NOT_FOUND', 'Sinh viên chưa có GVHD chính thức', HttpStatus.CONFLICT);
    }

    return assignment;
  }

  private async getStudentByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppException('STUDENT_NOT_ASSIGNED', 'Tài khoản chưa có hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    }
    return student;
  }

  private async getLecturerByUserId(userId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { userId } });
    if (!lecturer) {
      throw new AppException('SUPERVISOR_ASSIGNMENT_NOT_FOUND', 'Tài khoản chưa có hồ sơ giảng viên', HttpStatus.NOT_FOUND);
    }
    return lecturer;
  }

  private async getOutlineOrThrow(id: string) {
    const outline = await this.prisma.outline.findUnique({
      where: { id },
      include: this.outlineInclude(),
    });
    if (!outline) {
      throw new AppException('OUTLINE_NOT_FOUND', 'Không tìm thấy đề cương', HttpStatus.NOT_FOUND);
    }
    return outline;
  }

  private async ensureSupervisorOwnsOutline(id: string, actor: AuthUser) {
    const outline = await this.getOutlineOrThrow(id);
    const lecturer = await this.getLecturerByUserId(actor.id);
    if (outline.supervisorId !== lecturer.id) {
      throw new AppException('OUTLINE_NOT_FOUND', 'Không tìm thấy đề cương thuộc sinh viên bạn hướng dẫn', HttpStatus.NOT_FOUND);
    }
    return outline;
  }

  private async ensureCanView(outline: any, actor: AuthUser) {
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return;
    if (outline.student.userId === actor.id || outline.supervisor.userId === actor.id) return;
    throw new AppException('OUTLINE_NOT_FOUND', 'Không tìm thấy đề cương phù hợp với quyền truy cập', HttpStatus.NOT_FOUND);
  }

  private outlineInclude() {
    return {
      student: { include: { user: true } },
      supervisor: { include: { user: true } },
      projectPeriod: true,
      topicRegistration: { include: { topic: true } },
      supervisorAssignment: { include: { topic: true } },
      reviewedBy: { select: { id: true, email: true, fullName: true } },
      versions: { include: { fileDocument: true }, orderBy: { versionNumber: 'desc' as const } },
    };
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetType: 'Outline',
      targetId,
      result: 'SUCCESS',
    });
  }
}
