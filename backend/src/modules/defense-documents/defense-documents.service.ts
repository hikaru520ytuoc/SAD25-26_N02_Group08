import { HttpStatus, Injectable } from '@nestjs/common';
import { DefenseDocumentStatus, DefenseScheduleStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueryDefenseDocumentDto } from './dto/query-defense-document.dto';
import { RequestDefenseDocumentSupplementDto } from './dto/request-defense-document-supplement.dto';
import { ResubmitDefenseDocumentDto } from './dto/resubmit-defense-document.dto';
import { SubmitDefenseDocumentDto } from './dto/submit-defense-document.dto';

@Injectable()
export class DefenseDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly filesService: FilesService,
  ) {}

  async findMe(actor: AuthUser) {
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    return this.prisma.defenseDocument.findMany({ where: { studentId: student.id }, include: this.include(), orderBy: { updatedAt: 'desc' } });
  }

  async findSecretary(actor: AuthUser, query: QueryDefenseDocumentDto = {}) {
    const memberships = await this.prisma.councilMember.findMany({ where: { userId: actor.id, roleInCouncil: 'SECRETARY' }, select: { councilId: true } });
    const councilIds = memberships.map((item) => item.councilId);
    return this.prisma.defenseDocument.findMany({
      where: {
        status: query.status,
        defenseSchedule: { councilId: query.councilId ? query.councilId : { in: councilIds }, projectPeriodId: query.projectPeriodId },
      },
      include: this.include(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const document = await this.getDocumentOrThrow(id);
    await this.ensureCanView(document, actor);
    return document;
  }

  async submit(scheduleId: string, dto: SubmitDefenseDocumentDto, actor: AuthUser) {
    const schedule = await this.getScheduleOrThrow(scheduleId);
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student || schedule.studentId !== student.id) {
      throw new AppException('DEFENSE_DOCUMENT_NOT_FOUND', 'Không tìm thấy lịch bảo vệ của bạn', HttpStatus.NOT_FOUND);
    }
    if (schedule.status === DefenseScheduleStatus.CANCELLED) {
      throw new AppException('DEFENSE_DOCUMENT_INVALID_STATUS', 'Không nộp hồ sơ cho lịch đã hủy', HttpStatus.CONFLICT);
    }
    await this.validateAndMarkFiles(dto, actor, 'DEFENSE_DOCUMENT', scheduleId);

    const document = await this.prisma.defenseDocument.upsert({
      where: { defenseScheduleId: schedule.id },
      update: {
        reportFileId: dto.reportFileId,
        slideFileId: dto.slideFileId,
        additionalFileId: dto.additionalFileId,
        status: DefenseDocumentStatus.SUBMITTED,
        secretaryNote: null,
        submittedAt: new Date(),
      },
      create: {
        defenseScheduleId: schedule.id,
        defenseRegistrationId: schedule.defenseRegistrationId,
        studentId: schedule.studentId,
        reportFileId: dto.reportFileId,
        slideFileId: dto.slideFileId,
        additionalFileId: dto.additionalFileId,
        status: DefenseDocumentStatus.SUBMITTED,
      },
      include: this.include(),
    });

    await this.prisma.defenseSchedule.update({ where: { id: schedule.id }, data: { status: DefenseScheduleStatus.DOCUMENT_PENDING } });
    await this.audit(actor, 'DEFENSE_DOCUMENT_SUBMITTED', document.id);
    await this.notifySecretaries(schedule, 'Sinh viên đã nộp hồ sơ bảo vệ', `${actor.fullName} đã nộp hồ sơ bảo vệ chờ thư ký kiểm tra.`, 'DEFENSE_DOCUMENT_SUBMITTED');
    return document;
  }

  async requestSupplement(id: string, dto: RequestDefenseDocumentSupplementDto, actor: AuthUser) {
    const document = await this.getDocumentOrThrow(id);
    await this.ensureSecretaryOwnsDocument(document, actor);
    if (!dto.secretaryNote?.trim()) {
      throw new AppException('DEFENSE_DOCUMENT_SUPPLEMENT_NOTE_REQUIRED', 'Lý do yêu cầu bổ sung là bắt buộc', HttpStatus.BAD_REQUEST);
    }

    const updated = await this.prisma.defenseDocument.update({
      where: { id },
      data: { status: DefenseDocumentStatus.NEEDS_SUPPLEMENT, secretaryId: actor.id, secretaryNote: dto.secretaryNote.trim(), reviewedAt: new Date() },
      include: this.include(),
    });
    await this.prisma.defenseSchedule.update({ where: { id: document.defenseScheduleId }, data: { status: DefenseScheduleStatus.DOCUMENT_NEEDS_SUPPLEMENT } });
    await this.audit(actor, 'DEFENSE_DOCUMENT_SUPPLEMENT_REQUESTED', id);
    await this.notificationsService.create({
      userId: document.student.userId,
      title: 'Thư ký yêu cầu bổ sung hồ sơ bảo vệ',
      message: dto.secretaryNote.trim(),
      type: 'DEFENSE_DOCUMENT_SUPPLEMENT_REQUESTED',
    });
    return updated;
  }

  async resubmit(id: string, dto: ResubmitDefenseDocumentDto, actor: AuthUser) {
    const document = await this.getDocumentOrThrow(id);
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student || document.studentId !== student.id) {
      throw new AppException('DEFENSE_DOCUMENT_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ của bạn', HttpStatus.NOT_FOUND);
    }
    if (document.status !== DefenseDocumentStatus.NEEDS_SUPPLEMENT) {
      throw new AppException('DEFENSE_DOCUMENT_INVALID_STATUS', 'Chỉ bổ sung hồ sơ khi thư ký yêu cầu', HttpStatus.CONFLICT);
    }
    await this.validateAndMarkFiles(dto, actor, 'DEFENSE_DOCUMENT', document.defenseScheduleId);

    const updated = await this.prisma.defenseDocument.update({
      where: { id },
      data: {
        reportFileId: dto.reportFileId,
        slideFileId: dto.slideFileId,
        additionalFileId: dto.additionalFileId,
        status: DefenseDocumentStatus.SUBMITTED,
        secretaryNote: null,
        submittedAt: new Date(),
      },
      include: this.include(),
    });
    await this.prisma.defenseSchedule.update({ where: { id: document.defenseScheduleId }, data: { status: DefenseScheduleStatus.DOCUMENT_PENDING } });
    await this.audit(actor, 'DEFENSE_DOCUMENT_RESUBMITTED', id);
    await this.notifySecretaries(document.defenseSchedule, 'Sinh viên đã bổ sung hồ sơ bảo vệ', `${actor.fullName} đã bổ sung hồ sơ theo yêu cầu.`, 'DEFENSE_DOCUMENT_RESUBMITTED');
    return updated;
  }

  async approve(id: string, actor: AuthUser) {
    const document = await this.getDocumentOrThrow(id);
    await this.ensureSecretaryOwnsDocument(document, actor);
    if (!document.reportFileId || !document.slideFileId) {
      throw new AppException('DEFENSE_DOCUMENT_MISSING_REQUIRED_FILE', 'Hồ sơ cần có báo cáo và slide', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.prisma.defenseDocument.update({
      where: { id },
      data: { status: DefenseDocumentStatus.APPROVED, secretaryId: actor.id, reviewedAt: new Date() },
      include: this.include(),
    });
    await this.prisma.defenseSchedule.update({ where: { id: document.defenseScheduleId }, data: { status: DefenseScheduleStatus.DOCUMENT_APPROVED } });
    await this.audit(actor, 'DEFENSE_DOCUMENT_APPROVED', id);
    await this.notificationsService.create({
      userId: document.student.userId,
      title: 'Hồ sơ bảo vệ đã hợp lệ',
      message: 'Thư ký hội đồng đã xác nhận hồ sơ bảo vệ của bạn hợp lệ.',
      type: 'DEFENSE_DOCUMENT_APPROVED',
    });
    return updated;
  }

  private include() {
    return {
      student: { include: { user: true } },
      defenseSchedule: { include: { council: { include: { members: { include: { user: true, lecturer: { include: { user: true } } } } } } } },
      defenseRegistration: true,
      reportFile: true,
      slideFile: true,
      additionalFile: true,
      secretary: true,
    };
  }

  private async getScheduleOrThrow(id: string) {
    const schedule = await this.prisma.defenseSchedule.findUnique({
      where: { id },
      include: { student: { include: { user: true } }, council: { include: { members: { include: { user: true } } } }, defenseRegistration: true },
    });
    if (!schedule) throw new AppException('DEFENSE_SCHEDULE_NOT_FOUND', 'Không tìm thấy lịch bảo vệ', HttpStatus.NOT_FOUND);
    return schedule;
  }

  private async getDocumentOrThrow(id: string) {
    const document = await this.prisma.defenseDocument.findUnique({ where: { id }, include: this.include() });
    if (!document) throw new AppException('DEFENSE_DOCUMENT_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ', HttpStatus.NOT_FOUND);
    return document;
  }

  private async validateAndMarkFiles(dto: SubmitDefenseDocumentDto, actor: AuthUser, relatedType: string, relatedId: string) {
    if (!dto.reportFileId || !dto.slideFileId) {
      throw new AppException('DEFENSE_DOCUMENT_MISSING_REQUIRED_FILE', 'Báo cáo và slide là bắt buộc', HttpStatus.BAD_REQUEST);
    }
    await this.filesService.ensureCanAccess(dto.reportFileId, actor);
    await this.filesService.ensureCanAccess(dto.slideFileId, actor);
    if (dto.additionalFileId) await this.filesService.ensureCanAccess(dto.additionalFileId, actor);
    await this.filesService.markRelated(dto.reportFileId, relatedType, relatedId);
    await this.filesService.markRelated(dto.slideFileId, relatedType, relatedId);
    await this.filesService.markRelated(dto.additionalFileId, relatedType, relatedId);
  }

  private async ensureCanView(document: any, actor: AuthUser) {
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return;
    if (document.student.userId === actor.id) return;
    if (document.defenseSchedule.council.members.some((member: { userId: string }) => member.userId === actor.id)) return;
    throw new AppException('AUTH_FORBIDDEN', 'Bạn không có quyền xem hồ sơ bảo vệ này', HttpStatus.FORBIDDEN);
  }

  private async ensureSecretaryOwnsDocument(document: any, actor: AuthUser) {
    const isSecretary = document.defenseSchedule.council.members.some(
      (member: { userId: string; roleInCouncil: string }) => member.userId === actor.id && member.roleInCouncil === 'SECRETARY',
    );
    if (!isSecretary && !actor.roles.includes('ADMIN')) {
      throw new AppException('AUTH_FORBIDDEN', 'Chỉ thư ký hội đồng được kiểm tra hồ sơ này', HttpStatus.FORBIDDEN);
    }
  }

  private async notifySecretaries(schedule: { council: { members: { userId: string; roleInCouncil: string }[] } }, title: string, message: string, type: string) {
    for (const member of schedule.council.members.filter((item) => item.roleInCouncil === 'SECRETARY')) {
      await this.notificationsService.create({ userId: member.userId, title, message, type });
    }
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType: 'DefenseDocument', targetId, result: 'SUCCESS' });
  }
}
