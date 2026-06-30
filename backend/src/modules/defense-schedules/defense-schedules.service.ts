import { HttpStatus, Injectable } from '@nestjs/common';
import { DefenseCouncilStatus, DefenseRegistrationStatus, DefenseScheduleStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDefenseScheduleDto } from './dto/create-defense-schedule.dto';
import { QueryDefenseScheduleDto } from './dto/query-defense-schedule.dto';
import { UpdateDefenseScheduleDto } from './dto/update-defense-schedule.dto';

@Injectable()
export class DefenseSchedulesService {
  private readonly maxTopicsPerCouncil = 6;
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryDefenseScheduleDto = {}) {
    return this.prisma.defenseSchedule.findMany({
      where: { projectPeriodId: query.projectPeriodId, councilId: query.councilId, status: query.status },
      include: this.include(),
      orderBy: [{ defenseDate: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findMe(actor: AuthUser) {
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    return this.prisma.defenseSchedule.findMany({
      where: { studentId: student.id, status: { not: DefenseScheduleStatus.CANCELLED } },
      include: this.include(),
      orderBy: [{ defenseDate: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findCouncil(actor: AuthUser, query: QueryDefenseScheduleDto = {}) {
    const memberships = await this.prisma.councilMember.findMany({ where: { userId: actor.id }, select: { councilId: true } });
    const councilIds = memberships.map((item) => item.councilId);
    return this.prisma.defenseSchedule.findMany({
      where: {
        councilId: query.councilId ? query.councilId : { in: councilIds },
        projectPeriodId: query.projectPeriodId,
        status: query.status,
      },
      include: this.include(),
      orderBy: [{ defenseDate: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const schedule = await this.getScheduleOrThrow(id);
    await this.ensureCanView(schedule, actor);
    return schedule;
  }

  async create(dto: CreateDefenseScheduleDto, actor: AuthUser) {
    const registration = await this.prisma.defenseRegistration.findUnique({
      where: { id: dto.defenseRegistrationId },
      include: { student: { include: { user: true } }, reviewerAssignment: true, reviewerEvaluations: true, supervisor: { include: { user: true } } },
    });
    if (!registration) throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ', HttpStatus.NOT_FOUND);

    const allowed: DefenseRegistrationStatus[] = [DefenseRegistrationStatus.READY_FOR_COUNCIL, DefenseRegistrationStatus.APPROVED_BY_REVIEWER];
    if (!allowed.includes(registration.status)) {
      throw new AppException('DEFENSE_REGISTRATION_NOT_READY', 'Chỉ xếp lịch cho hồ sơ đã đủ điều kiện sau phản biện', HttpStatus.CONFLICT);
    }

    const council = await this.prisma.defenseCouncil.findUnique({ where: { id: dto.councilId }, include: { members: { include: { user: true } } } });
    if (!council || council.status !== DefenseCouncilStatus.ACTIVE) {
      throw new AppException('COUNCIL_NOT_FOUND', 'Không tìm thấy hội đồng ACTIVE', HttpStatus.NOT_FOUND);
    }
    this.ensureCouncilHasChairAndSecretary(council.members);

    const defenseDate = new Date(dto.defenseDate);
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    this.validateTime(startTime, endTime);
    await this.ensureCouncilCanReceiveTopic(dto.councilId);
    await this.ensureNoConflict(dto.councilId, dto.room, startTime, endTime);

    const schedule = await this.prisma.defenseSchedule.create({
      data: {
        defenseRegistrationId: registration.id,
        studentId: registration.studentId,
        projectPeriodId: registration.projectPeriodId,
        councilId: dto.councilId,
        room: dto.room.trim(),
        defenseDate,
        startTime,
        endTime,
        status: DefenseScheduleStatus.DOCUMENT_PENDING,
        createdById: actor.id,
      },
      include: this.include(),
    }).catch((error) => {
      if (error?.code === 'P2002') throw new AppException('DEFENSE_SCHEDULE_EXISTS', 'Hồ sơ này đã có lịch bảo vệ', HttpStatus.CONFLICT);
      throw error;
    });

    await this.audit(actor, 'DEFENSE_SCHEDULE_CREATED', schedule.id);
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'Bạn đã có lịch bảo vệ',
      message: `Lịch bảo vệ của bạn được xếp tại ${schedule.room} vào ${schedule.startTime.toISOString()}.`,
      type: 'DEFENSE_SCHEDULE_CREATED',
    });
    for (const member of council.members) {
      await this.notificationsService.create({
        userId: member.userId,
        title: 'Có lịch bảo vệ mới trong hội đồng',
        message: `${registration.student.user.fullName} được xếp lịch bảo vệ trong ${council.name}.`,
        type: 'DEFENSE_SCHEDULE_CREATED',
      });
    }
    return schedule;
  }

  async update(id: string, dto: UpdateDefenseScheduleDto, actor: AuthUser) {
    const schedule = await this.getScheduleOrThrow(id);
    if (schedule.status === DefenseScheduleStatus.CANCELLED || schedule.status === DefenseScheduleStatus.COMPLETED) {
      throw new AppException('DEFENSE_SCHEDULE_INVALID_STATUS', 'Không cập nhật lịch đã hủy hoặc hoàn thành', HttpStatus.CONFLICT);
    }
    const councilId = dto.councilId ?? schedule.councilId;
    const room = dto.room?.trim() ?? schedule.room;
    const defenseDate = dto.defenseDate ? new Date(dto.defenseDate) : schedule.defenseDate;
    const startTime = dto.startTime ? new Date(dto.startTime) : schedule.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : schedule.endTime;
    this.validateTime(startTime, endTime);
    await this.ensureCouncilCanReceiveTopic(councilId, id);
    await this.ensureNoConflict(councilId, room, startTime, endTime, id);

    if (dto.councilId) {
      const council = await this.prisma.defenseCouncil.findUnique({ where: { id: dto.councilId } });
      if (!council || council.status !== DefenseCouncilStatus.ACTIVE) throw new AppException('COUNCIL_NOT_FOUND', 'Không tìm thấy hội đồng ACTIVE', HttpStatus.NOT_FOUND);
    }

    const updated = await this.prisma.defenseSchedule.update({
      where: { id },
      data: { councilId, room, defenseDate, startTime, endTime, status: dto.status },
      include: this.include(),
    });
    await this.audit(actor, dto.status === DefenseScheduleStatus.CANCELLED ? 'DEFENSE_SCHEDULE_CANCELLED' : 'DEFENSE_SCHEDULE_UPDATED', id);
    return updated;
  }

  async cancel(id: string, actor: AuthUser) {
    const updated = await this.prisma.defenseSchedule.update({ where: { id }, data: { status: DefenseScheduleStatus.CANCELLED }, include: this.include() });
    await this.audit(actor, 'DEFENSE_SCHEDULE_CANCELLED', id);
    return updated;
  }

  private include() {
    return {
      defenseRegistration: { include: { student: { include: { user: true } }, supervisor: { include: { user: true } }, reviewerAssignment: { include: { reviewer: { include: { user: true } } } } } },
      student: { include: { user: true } },
      projectPeriod: true,
      council: { include: { members: { include: { lecturer: { include: { user: true } }, user: true } } } },
      defenseDocument: true,
    };
  }

  private async getScheduleOrThrow(id: string) {
    const schedule = await this.prisma.defenseSchedule.findUnique({ where: { id }, include: this.include() });
    if (!schedule) throw new AppException('DEFENSE_SCHEDULE_NOT_FOUND', 'Không tìm thấy lịch bảo vệ', HttpStatus.NOT_FOUND);
    return schedule;
  }

  private validateTime(startTime: Date, endTime: Date) {
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
      throw new AppException('DEFENSE_SCHEDULE_INVALID_TIME', 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc', HttpStatus.BAD_REQUEST);
    }
  }

  private async ensureCouncilCanReceiveTopic(councilId: string, excludeScheduleId?: string) {
    const currentTopicCount = await this.prisma.defenseSchedule.count({
      where: {
        councilId,
        id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
        status: { not: DefenseScheduleStatus.CANCELLED },
      },
    });

    if (currentTopicCount >= this.maxTopicsPerCouncil) {
      throw new AppException(
        'COUNCIL_TOPIC_LIMIT_EXCEEDED',
        `Một hội đồng chỉ được xếp tối đa ${this.maxTopicsPerCouncil} đề tài`,
        HttpStatus.CONFLICT,
      );
    }
  }

  private async ensureNoConflict(councilId: string, room: string, startTime: Date, endTime: Date, excludeId?: string) {
    const roomOrCouncilConflict = await this.prisma.defenseSchedule.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        status: { not: DefenseScheduleStatus.CANCELLED },
        OR: [{ councilId }, { room }],
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: { council: true },
    });
    if (roomOrCouncilConflict) {
      throw new AppException(
        'DEFENSE_SCHEDULE_CONFLICT',
        'Trùng lịch theo phòng hoặc hội đồng trong cùng khoảng thời gian',
        HttpStatus.CONFLICT,
      );
    }

    const members = await this.prisma.councilMember.findMany({
      where: { councilId },
      select: { lecturerId: true, lecturer: { include: { user: true } } },
    });
    const lecturerIds = members.map((member) => member.lecturerId);
    if (!lecturerIds.length) return;

    const memberConflict = await this.prisma.defenseSchedule.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        status: { not: DefenseScheduleStatus.CANCELLED },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        council: {
          members: {
            some: {
              lecturerId: { in: lecturerIds },
            },
          },
        },
      },
      include: {
        council: {
          include: {
            members: {
              where: { lecturerId: { in: lecturerIds } },
              include: { lecturer: { include: { user: true } } },
            },
          },
        },
      },
    });

    if (memberConflict) {
      const conflictMemberNames = memberConflict.council.members
        .map((member) => member.lecturer.user.fullName)
        .join(', ');
      throw new AppException(
        'COUNCIL_MEMBER_TIME_CONFLICT',
        `Không thể xếp lịch vì thành viên hội đồng bị trùng thời gian: ${conflictMemberNames}`,
        HttpStatus.CONFLICT,
      );
    }
  }

  private ensureCouncilHasChairAndSecretary(members: { roleInCouncil: string }[]) {
    const hasChair = members.some((member) => member.roleInCouncil === 'CHAIR');
    const hasSecretary = members.some((member) => member.roleInCouncil === 'SECRETARY');
    if (!hasChair) throw new AppException('COUNCIL_CHAIR_REQUIRED', 'Hội đồng cần có chủ tịch', HttpStatus.BAD_REQUEST);
    if (!hasSecretary) throw new AppException('COUNCIL_SECRETARY_REQUIRED', 'Hội đồng cần có thư ký', HttpStatus.BAD_REQUEST);
  }

  private async ensureCanView(schedule: any, actor: AuthUser) {
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return;
    if (schedule.student.userId === actor.id) return;
    if (schedule.defenseRegistration.supervisor.userId === actor.id) return;
    if (schedule.defenseRegistration.reviewerAssignment?.reviewer.userId === actor.id) return;
    if (schedule.council.members.some((member: { userId: string }) => member.userId === actor.id)) return;
    throw new AppException('AUTH_FORBIDDEN', 'Bạn không có quyền xem lịch bảo vệ này', HttpStatus.FORBIDDEN);
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType: 'DefenseSchedule', targetId, result: 'SUCCESS' });
  }
}
