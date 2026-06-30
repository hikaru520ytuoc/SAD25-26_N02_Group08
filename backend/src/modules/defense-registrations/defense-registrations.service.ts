import { HttpStatus, Injectable } from '@nestjs/common';
import { DefenseRegistrationStatus, FileDocumentType, OutlineStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RecordLockService } from '../record-lock/record-lock.service';
import { CreateDefenseRegistrationDto } from './dto/create-defense-registration.dto';
import { QueryDefenseRegistrationDto } from './dto/query-defense-registration.dto';
import { ResubmitDefenseRegistrationDto } from './dto/resubmit-defense-registration.dto';
import { SupervisorApproveDefenseDto } from './dto/supervisor-approve-defense.dto';
import { SupervisorRejectDefenseDto } from './dto/supervisor-reject-defense.dto';

@Injectable()
export class DefenseRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly filesService: FilesService,
    private readonly recordLockService: RecordLockService,
  ) {}

  async findMe(actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    return this.prisma.defenseRegistration.findFirst({
      where: { studentId: student.id },
      include: this.include(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findSupervisor(actor: AuthUser, query: QueryDefenseRegistrationDto = {}) {
    const lecturer = await this.getLecturerByUserId(actor.id);
    return this.prisma.defenseRegistration.findMany({
      where: { supervisorId: lecturer.id, status: query.status, projectPeriodId: query.projectPeriodId },
      include: this.include(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findFaculty(query: QueryDefenseRegistrationDto = {}) {
    return this.prisma.defenseRegistration.findMany({
      where: { status: query.status, projectPeriodId: query.projectPeriodId },
      include: this.include(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const registration = await this.getRegistrationOrThrow(id);
    await this.ensureCanView(registration, actor);
    return registration;
  }

  async create(dto: CreateDefenseRegistrationDto, actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    const outline = await this.prisma.outline.findFirst({
      where: { studentId: student.id, status: OutlineStatus.APPROVED },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
        supervisorAssignment: true,
        topicRegistration: true,
        projectPeriod: true,
      },
      orderBy: { reviewedAt: 'desc' },
    });

    if (!outline) {
      throw new AppException('OUTLINE_NOT_APPROVED', 'Sinh viên chỉ được đăng ký bảo vệ khi đề cương đã được duyệt', HttpStatus.CONFLICT);
    }

    await this.recordLockService.checkProjectRecordLocked(student.id, outline.projectPeriodId);

    const existing = await this.prisma.defenseRegistration.findUnique({
      where: { studentId_projectPeriodId: { studentId: student.id, projectPeriodId: outline.projectPeriodId } },
    });
    if (existing) {
      throw new AppException('DEFENSE_REGISTRATION_EXISTS', 'Sinh viên đã có đăng ký bảo vệ trong đợt này', HttpStatus.CONFLICT);
    }

    await this.validateDefenseFiles(dto.reportFileId, dto.slideFileId, dto.additionalDocumentFileId, actor);

    const registration = await this.prisma.defenseRegistration.create({
      data: {
        studentId: student.id,
        supervisorId: outline.supervisorId,
        supervisorAssignmentId: outline.supervisorAssignmentId,
        topicRegistrationId: outline.topicRegistrationId,
        outlineId: outline.id,
        projectPeriodId: outline.projectPeriodId,
        reportFileId: dto.reportFileId,
        slideFileId: dto.slideFileId,
        additionalDocumentFileId: dto.additionalDocumentFileId,
        title: dto.title.trim(),
        summary: dto.summary,
        studentNote: dto.studentNote,
        status: DefenseRegistrationStatus.SUBMITTED,
      },
      include: this.include(),
    });

    await this.markFiles(registration.id, dto.reportFileId, dto.slideFileId, dto.additionalDocumentFileId);
    await this.audit(actor, 'DEFENSE_REGISTRATION_CREATED', registration.id);
    await this.notificationsService.create({
      userId: outline.supervisor.userId,
      title: 'Sinh viên đăng ký bảo vệ',
      message: `${actor.fullName} đã nộp hồ sơ đăng ký bảo vệ chờ GVHD kiểm tra.`,
      type: 'DEFENSE_REGISTRATION_SUBMITTED',
    });

    return registration;
  }

  async resubmit(id: string, dto: ResubmitDefenseRegistrationDto, actor: AuthUser) {
    const registration = await this.getRegistrationOrThrow(id);
    const student = await this.getStudentByUserId(actor.id);
    if (registration.studentId !== student.id) {
      throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký bảo vệ của bạn', HttpStatus.NOT_FOUND);
    }
    await this.recordLockService.checkProjectRecordLocked(registration.studentId, registration.projectPeriodId);

    const allowed: DefenseRegistrationStatus[] = [DefenseRegistrationStatus.NEEDS_REVISION, DefenseRegistrationStatus.REVIEWER_NEEDS_REVISION];
    if (!allowed.includes(registration.status)) {
      throw new AppException('DEFENSE_REGISTRATION_INVALID_STATUS', 'Chỉ được nộp lại khi hồ sơ bị yêu cầu chỉnh sửa', HttpStatus.CONFLICT);
    }

    await this.validateDefenseFiles(dto.reportFileId, dto.slideFileId, dto.additionalDocumentFileId, actor);

    const updated = await this.prisma.defenseRegistration.update({
      where: { id },
      data: {
        title: dto.title.trim(),
        summary: dto.summary,
        studentNote: dto.studentNote,
        reportFileId: dto.reportFileId,
        slideFileId: dto.slideFileId,
        additionalDocumentFileId: dto.additionalDocumentFileId,
        status: DefenseRegistrationStatus.SUBMITTED,
        supervisorFeedback: null,
        supervisorReviewedAt: null,
        supervisorReviewedById: null,
        submittedAt: new Date(),
      },
      include: this.include(),
    });

    await this.markFiles(id, dto.reportFileId, dto.slideFileId, dto.additionalDocumentFileId);
    await this.audit(actor, 'DEFENSE_REGISTRATION_RESUBMITTED', id);
    await this.notificationsService.create({
      userId: registration.supervisor.userId,
      title: 'Sinh viên nộp lại hồ sơ bảo vệ',
      message: `${actor.fullName} đã nộp lại hồ sơ đăng ký bảo vệ sau khi chỉnh sửa.`,
      type: 'DEFENSE_REGISTRATION_SUBMITTED',
    });

    return updated;
  }

  async supervisorApprove(id: string, dto: SupervisorApproveDefenseDto, actor: AuthUser) {
    const registration = await this.ensureSupervisorOwnsRegistration(id, actor);
    await this.recordLockService.checkProjectRecordLocked(registration.studentId, registration.projectPeriodId);
    this.validateScore(dto.score, 'SUPERVISOR_SCORE_INVALID');

    const allowed: DefenseRegistrationStatus[] = [DefenseRegistrationStatus.SUBMITTED, DefenseRegistrationStatus.NEEDS_REVISION];
    if (!allowed.includes(registration.status)) {
      throw new AppException('DEFENSE_REGISTRATION_INVALID_STATUS', 'Chỉ duyệt được hồ sơ đang chờ GVHD xử lý', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.defenseRegistration.update({
      where: { id },
      data: {
        status: DefenseRegistrationStatus.APPROVED_BY_SUPERVISOR,
        supervisorFeedback: null,
        supervisorReviewedAt: new Date(),
        supervisorReviewedById: actor.id,
        supervisorScore: {
          upsert: {
            update: { score: dto.score, comment: dto.comment },
            create: { supervisorId: registration.supervisorId, score: dto.score, comment: dto.comment },
          },
        },
      },
      include: this.include(),
    });

    await this.audit(actor, 'DEFENSE_REGISTRATION_APPROVED_BY_SUPERVISOR', id);
    await this.audit(actor, 'SUPERVISOR_SCORE_CREATED', id);
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'GVHD xác nhận đủ điều kiện bảo vệ',
      message: 'GVHD đã xác nhận hồ sơ đủ điều kiện bảo vệ và nhập điểm hướng dẫn.',
      type: 'DEFENSE_REGISTRATION_APPROVED_BY_SUPERVISOR',
    });

    return updated;
  }

  async supervisorReject(id: string, dto: SupervisorRejectDefenseDto, actor: AuthUser) {
    const registration = await this.ensureSupervisorOwnsRegistration(id, actor);
    await this.recordLockService.checkProjectRecordLocked(registration.studentId, registration.projectPeriodId);
    if (!dto.feedback?.trim()) {
      throw new AppException('SUPERVISOR_FEEDBACK_REQUIRED', 'Feedback là bắt buộc khi xác nhận chưa đủ điều kiện', HttpStatus.BAD_REQUEST);
    }

    const updated = await this.prisma.defenseRegistration.update({
      where: { id },
      data: {
        status: DefenseRegistrationStatus.NEEDS_REVISION,
        supervisorFeedback: dto.feedback.trim(),
        supervisorReviewedAt: new Date(),
        supervisorReviewedById: actor.id,
      },
      include: this.include(),
    });

    await this.audit(actor, 'DEFENSE_REGISTRATION_REJECTED_BY_SUPERVISOR', id);
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'GVHD yêu cầu chỉnh sửa hồ sơ bảo vệ',
      message: dto.feedback.trim(),
      type: 'DEFENSE_REGISTRATION_NEEDS_REVISION',
    });

    return updated;
  }

  async getRegistrationOrThrow(id: string) {
    const registration = await this.prisma.defenseRegistration.findUnique({ where: { id }, include: this.include() });
    if (!registration) {
      throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký bảo vệ', HttpStatus.NOT_FOUND);
    }
    return registration;
  }

  private include() {
    return {
      student: { include: { user: true } },
      supervisor: { include: { user: true } },
      supervisorAssignment: true,
      topicRegistration: { include: { topic: true } },
      outline: true,
      projectPeriod: true,
      reportFile: true,
      slideFile: true,
      additionalDocumentFile: true,
      supervisorScore: true,
      reviewerAssignment: { include: { reviewer: { include: { user: true } }, evaluation: true, reviewerScore: true } },
    } as const;
  }

  private async validateDefenseFiles(reportFileId: string, slideFileId: string | undefined, additionalDocumentFileId: string | undefined, actor: AuthUser) {
    if (!reportFileId) {
      throw new AppException('FILE_NOT_FOUND', 'Báo cáo bảo vệ là bắt buộc', HttpStatus.BAD_REQUEST);
    }
    await this.filesService.ensureCanAccess(reportFileId, actor);
    if (slideFileId) await this.filesService.ensureCanAccess(slideFileId, actor);
    if (additionalDocumentFileId) await this.filesService.ensureCanAccess(additionalDocumentFileId, actor);
  }

  private async markFiles(registrationId: string, reportFileId?: string, slideFileId?: string, additionalDocumentFileId?: string) {
    await this.filesService.markRelated(reportFileId, 'DEFENSE_REGISTRATION', registrationId);
    await this.filesService.markRelated(slideFileId, 'DEFENSE_REGISTRATION', registrationId);
    await this.filesService.markRelated(additionalDocumentFileId, 'DEFENSE_REGISTRATION', registrationId);
  }

  private validateScore(score: number, errorCode: string) {
    if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 10) {
      throw new AppException(errorCode, 'Điểm phải nằm trong khoảng 0 đến 10', HttpStatus.BAD_REQUEST);
    }
  }

  private async ensureSupervisorOwnsRegistration(id: string, actor: AuthUser) {
    const registration = await this.getRegistrationOrThrow(id);
    const lecturer = await this.getLecturerByUserId(actor.id);
    if (registration.supervisorId !== lecturer.id) {
      throw new AppException('DEFENSE_REGISTRATION_NOT_ALLOWED', 'GVHD không có quyền xử lý hồ sơ này', HttpStatus.FORBIDDEN);
    }
    return registration;
  }

  private async ensureCanView(registration: any, actor: AuthUser) {
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return;
    if (registration.student?.userId === actor.id || registration.supervisor?.userId === actor.id) return;
    if (registration.reviewerAssignment?.reviewer?.userId === actor.id) return;
    throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký bảo vệ', HttpStatus.NOT_FOUND);
  }

  private async getStudentByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId }, include: { user: true } });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    return student;
  }

  private async getLecturerByUserId(userId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { userId }, include: { user: true } });
    if (!lecturer) throw new AppException('SUPERVISOR_NOT_FOUND', 'Không tìm thấy hồ sơ giảng viên', HttpStatus.NOT_FOUND);
    return lecturer;
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetType: 'DefenseRegistration',
      targetId,
      result: 'SUCCESS',
    });
  }
}
