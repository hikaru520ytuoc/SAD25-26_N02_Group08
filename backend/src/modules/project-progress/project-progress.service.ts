import { HttpStatus, Injectable } from '@nestjs/common';
import { OutlineStatus, ProjectProgressStatus, SupervisorAssignmentStatus, TopicRegistrationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateProgressCommentDto } from './dto/create-progress-comment.dto';
import { CreateProjectProgressDto } from './dto/create-project-progress.dto';
import { QueryProjectProgressDto } from './dto/query-project-progress.dto';
import { UpdateProjectProgressDto } from './dto/update-project-progress.dto';

@Injectable()
export class ProjectProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly filesService: FilesService,
  ) {}

  async findMe(actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    return this.prisma.projectProgress.findMany({
      where: { studentId: student.id },
      include: this.progressInclude(),
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findSupervisor(actor: AuthUser, query: QueryProjectProgressDto = {}) {
    const lecturer = await this.getLecturerByUserId(actor.id);
    return this.prisma.projectProgress.findMany({
      where: {
        supervisorId: lecturer.id,
        studentId: query.studentId,
        projectPeriodId: query.projectPeriodId,
      },
      include: this.progressInclude(),
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const progress = await this.getProgressOrThrow(id);
    await this.ensureCanView(progress, actor);
    return progress;
  }

  async create(dto: CreateProjectProgressDto, actor: AuthUser) {
    this.validateProgressPercent(dto.progressPercent);
    const assignment = await this.getCurrentStudentAssignment(actor.id);
    await this.ensureOutlineApproved(assignment.id);

    if (dto.fileDocumentId) {
      await this.filesService.ensureCanAccess(dto.fileDocumentId, actor);
    }

    const progress = await this.prisma.projectProgress.create({
      data: {
        studentId: assignment.studentId,
        supervisorId: assignment.supervisorId,
        supervisorAssignmentId: assignment.id,
        projectPeriodId: assignment.projectPeriodId,
        title: dto.title.trim(),
        content: dto.content.trim(),
        progressPercent: dto.progressPercent,
        fileDocumentId: dto.fileDocumentId,
      },
      include: this.progressInclude(),
    });

    await this.filesService.markRelated(dto.fileDocumentId, 'PROJECT_PROGRESS', progress.id);
    await this.audit(actor, 'PROGRESS_CREATED', progress.id);
    await this.notificationsService.create({
      userId: assignment.supervisor.userId,
      title: 'Sinh viên cập nhật tiến độ',
      message: `${actor.fullName} đã cập nhật tiến độ đồ án.`,
      type: 'PROGRESS_UPDATED',
    });

    return progress;
  }

  async update(id: string, dto: UpdateProjectProgressDto, actor: AuthUser) {
    this.validateProgressPercent(dto.progressPercent);
    const progress = await this.getProgressOrThrow(id);
    const student = await this.getStudentByUserId(actor.id);
    if (progress.studentId !== student.id) {
      throw new AppException('PROJECT_PROGRESS_NOT_FOUND', 'Không tìm thấy tiến độ của bạn', HttpStatus.NOT_FOUND);
    }

    if (dto.fileDocumentId) {
      await this.filesService.ensureCanAccess(dto.fileDocumentId, actor);
    }

    const updated = await this.prisma.projectProgress.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        content: dto.content?.trim(),
        progressPercent: dto.progressPercent,
        fileDocumentId: dto.fileDocumentId,
        status: ProjectProgressStatus.SUBMITTED,
      },
      include: this.progressInclude(),
    });

    await this.filesService.markRelated(dto.fileDocumentId, 'PROJECT_PROGRESS', id);
    await this.audit(actor, 'PROGRESS_UPDATED', id);
    return updated;
  }

  async addComment(id: string, dto: CreateProgressCommentDto, actor: AuthUser) {
    if (!dto.comment?.trim()) {
      throw new AppException('VALIDATION_ERROR', 'Nội dung góp ý không được rỗng', HttpStatus.BAD_REQUEST);
    }

    const progress = await this.ensureSupervisorOwnsProgress(id, actor);
    const comment = await this.prisma.projectProgressComment.create({
      data: {
        progressId: id,
        commenterId: actor.id,
        comment: dto.comment.trim(),
      },
      include: { commenter: { select: { id: true, email: true, fullName: true } } },
    });

    await this.prisma.projectProgress.update({
      where: { id },
      data: { status: ProjectProgressStatus.REVIEWED },
    });

    await this.audit(actor, 'PROGRESS_COMMENTED', id);
    await this.notificationsService.create({
      userId: progress.student.userId,
      title: 'GVHD góp ý tiến độ',
      message: dto.comment.trim(),
      type: 'PROGRESS_COMMENTED',
    });

    return comment;
  }

  async getComments(id: string, actor: AuthUser) {
    const progress = await this.findOne(id, actor);
    return progress.comments;
  }

  private async getCurrentStudentAssignment(userId: string) {
    const student = await this.getStudentByUserId(userId);
    const assignment = await this.prisma.supervisorAssignment.findFirst({
      where: { studentId: student.id, status: SupervisorAssignmentStatus.ACTIVE },
      include: { topicRegistration: true, supervisor: { include: { user: true } }, student: { include: { user: true } }, projectPeriod: true },
      orderBy: { assignedAt: 'desc' },
    });

    if (!assignment || assignment.topicRegistration.status !== TopicRegistrationStatus.OFFICIALLY_ASSIGNED) {
      throw new AppException('SUPERVISOR_ASSIGNMENT_NOT_FOUND', 'Sinh viên chưa có GVHD chính thức', HttpStatus.CONFLICT);
    }

    return assignment;
  }

  private async ensureOutlineApproved(supervisorAssignmentId: string) {
    const outline = await this.prisma.outline.findFirst({
      where: { supervisorAssignmentId, status: OutlineStatus.APPROVED },
    });
    if (!outline) {
      throw new AppException('PROJECT_PROGRESS_NOT_ALLOWED', 'Chỉ được cập nhật tiến độ sau khi đề cương được duyệt', HttpStatus.CONFLICT);
    }
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

  private async getProgressOrThrow(id: string) {
    const progress = await this.prisma.projectProgress.findUnique({
      where: { id },
      include: this.progressInclude(),
    });
    if (!progress) {
      throw new AppException('PROJECT_PROGRESS_NOT_FOUND', 'Không tìm thấy cập nhật tiến độ', HttpStatus.NOT_FOUND);
    }
    return progress;
  }

  private async ensureSupervisorOwnsProgress(id: string, actor: AuthUser) {
    const progress = await this.getProgressOrThrow(id);
    const lecturer = await this.getLecturerByUserId(actor.id);
    if (progress.supervisorId !== lecturer.id) {
      throw new AppException('PROJECT_PROGRESS_NOT_FOUND', 'Không tìm thấy tiến độ thuộc sinh viên bạn hướng dẫn', HttpStatus.NOT_FOUND);
    }
    return progress;
  }

  private async ensureCanView(progress: any, actor: AuthUser) {
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return;
    if (progress.student.userId === actor.id || progress.supervisor.userId === actor.id) return;
    throw new AppException('PROJECT_PROGRESS_NOT_FOUND', 'Không tìm thấy tiến độ phù hợp với quyền truy cập', HttpStatus.NOT_FOUND);
  }

  private validateProgressPercent(value?: number) {
    if (value === undefined || value === null) return;
    if (value < 0 || value > 100) {
      throw new AppException('PROGRESS_PERCENT_INVALID', 'Phần trăm tiến độ phải nằm trong khoảng 0-100', HttpStatus.BAD_REQUEST);
    }
  }

  private progressInclude() {
    return {
      student: { include: { user: true } },
      supervisor: { include: { user: true } },
      projectPeriod: true,
      supervisorAssignment: { include: { topic: true, topicRegistration: true } },
      fileDocument: true,
      comments: {
        include: { commenter: { select: { id: true, email: true, fullName: true } } },
        orderBy: { createdAt: 'asc' as const },
      },
    };
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetType: 'ProjectProgress',
      targetId,
      result: 'SUCCESS',
    });
  }
}
