import { HttpStatus, Injectable } from '@nestjs/common';
import { CouncilRole } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateDefenseSessionDto } from './dto/create-defense-session.dto';
import { UpdateDefenseSessionDto } from './dto/update-defense-session.dto';

@Injectable()
export class DefenseSessionsService {
  constructor(private readonly prisma: PrismaService, private readonly auditLogsService: AuditLogsService) {}

  async getBySchedule(scheduleId: string, actor: AuthUser) {
    await this.ensureScheduleAccess(scheduleId, actor);
    return this.prisma.defenseSession.findUnique({ where: { defenseScheduleId: scheduleId } });
  }

  async create(dto: CreateDefenseSessionDto, actor: AuthUser) {
    const schedule = await this.ensureSecretaryOrFaculty(dto.defenseScheduleId, actor);
    const session = await this.prisma.defenseSession.upsert({
      where: { defenseScheduleId: schedule.id },
      update: {
        sessionStatus: dto.sessionStatus,
        generalComment: dto.generalComment,
        conclusion: dto.conclusion,
        revisionRequired: dto.revisionRequired,
        revisionNote: dto.revisionNote,
      },
      create: {
        defenseScheduleId: schedule.id,
        defenseRegistrationId: schedule.defenseRegistrationId,
        councilId: schedule.councilId,
        sessionStatus: dto.sessionStatus,
        generalComment: dto.generalComment,
        conclusion: dto.conclusion,
        revisionRequired: dto.revisionRequired ?? false,
        revisionNote: dto.revisionNote,
        createdById: actor.id,
      },
    });
    await this.audit(actor, 'DEFENSE_SESSION_CREATED', session.id);
    return session;
  }

  async update(id: string, dto: UpdateDefenseSessionDto, actor: AuthUser) {
    const existing = await this.prisma.defenseSession.findUnique({ where: { id } });
    if (!existing) throw new AppException('DEFENSE_SESSION_NOT_FOUND', 'Không tìm thấy biên bản bảo vệ', HttpStatus.NOT_FOUND);
    await this.ensureSecretaryOrFaculty(existing.defenseScheduleId, actor);
    const updated = await this.prisma.defenseSession.update({
      where: { id },
      data: {
        sessionStatus: dto.sessionStatus,
        generalComment: dto.generalComment,
        conclusion: dto.conclusion,
        revisionRequired: dto.revisionRequired,
        revisionNote: dto.revisionNote,
      },
    });
    await this.audit(actor, 'DEFENSE_SESSION_UPDATED', id);
    return updated;
  }

  private async ensureScheduleAccess(scheduleId: string, actor: AuthUser) {
    const schedule = await this.prisma.defenseSchedule.findUnique({ where: { id: scheduleId }, include: { council: { include: { members: true } }, student: true } });
    if (!schedule) throw new AppException('DEFENSE_SCHEDULE_NOT_FOUND', 'Không tìm thấy lịch bảo vệ', HttpStatus.NOT_FOUND);
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER') || schedule.student.userId === actor.id || schedule.council.members.some((member) => member.userId === actor.id)) return schedule;
    throw new AppException('AUTH_FORBIDDEN', 'Bạn không có quyền xem biên bản này', HttpStatus.FORBIDDEN);
  }

  private async ensureSecretaryOrFaculty(scheduleId: string, actor: AuthUser) {
    const schedule = await this.prisma.defenseSchedule.findUnique({ where: { id: scheduleId }, include: { council: { include: { members: true } } } });
    if (!schedule) throw new AppException('DEFENSE_SCHEDULE_NOT_FOUND', 'Không tìm thấy lịch bảo vệ', HttpStatus.NOT_FOUND);
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return schedule;
    const secretary = schedule.council.members.find((member) => member.userId === actor.id && member.roleInCouncil === CouncilRole.SECRETARY);
    if (!secretary) throw new AppException('AUTH_FORBIDDEN', 'Chỉ thư ký hội đồng hoặc Khoa được cập nhật biên bản', HttpStatus.FORBIDDEN);
    return schedule;
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType: 'DefenseSession', targetId, result: 'SUCCESS' });
  }
}
