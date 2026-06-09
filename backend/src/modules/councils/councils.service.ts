import { HttpStatus, Injectable } from '@nestjs/common';
import { CouncilRole, DefenseCouncilStatus, DefenseScheduleStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AddCouncilMemberDto } from './dto/add-council-member.dto';
import { CreateCouncilDto } from './dto/create-council.dto';
import { QueryCouncilDto } from './dto/query-council.dto';
import { UpdateCouncilMemberDto } from './dto/update-council-member.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';

@Injectable()
export class CouncilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryCouncilDto = {}) {
    return this.prisma.defenseCouncil.findMany({
      where: { projectPeriodId: query.projectPeriodId, status: query.status },
      include: this.include(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.getCouncilOrThrow(id);
  }

  async create(dto: CreateCouncilDto, actor: AuthUser) {
    await this.ensureProjectPeriodExists(dto.projectPeriodId);
    if (dto.facultyId) await this.ensureFacultyExists(dto.facultyId);

    const council = await this.prisma.defenseCouncil.create({
      data: {
        name: dto.name.trim(),
        projectPeriodId: dto.projectPeriodId,
        facultyId: dto.facultyId,
        description: dto.description,
        status: dto.status ?? DefenseCouncilStatus.DRAFT,
        createdById: actor.id,
      },
      include: this.include(),
    });

    await this.audit(actor, 'COUNCIL_CREATED', council.id);
    return council;
  }

  async update(id: string, dto: UpdateCouncilDto, actor: AuthUser) {
    const council = await this.getCouncilOrThrow(id);
    if (dto.projectPeriodId) await this.ensureProjectPeriodExists(dto.projectPeriodId);
    if (dto.facultyId) await this.ensureFacultyExists(dto.facultyId);
    if (dto.status === DefenseCouncilStatus.ACTIVE) this.ensureCouncilReadyForActivation(council.members);

    const updated = await this.prisma.defenseCouncil.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        projectPeriodId: dto.projectPeriodId,
        facultyId: dto.facultyId,
        description: dto.description,
        status: dto.status,
      },
      include: this.include(),
    });

    await this.audit(actor, 'COUNCIL_UPDATED', id);
    return updated;
  }

  async addMember(councilId: string, dto: AddCouncilMemberDto, actor: AuthUser) {
    const council = await this.getCouncilOrThrow(councilId);
    const lecturer = await this.prisma.lecturer.findUnique({ where: { id: dto.lecturerId }, include: { user: true } });
    if (!lecturer) throw new AppException('LECTURER_NOT_FOUND', 'Không tìm thấy giảng viên', HttpStatus.NOT_FOUND);

    await this.ensureUniqueChairSecretary(councilId, dto.roleInCouncil);

    const member = await this.prisma.councilMember.create({
      data: { councilId, lecturerId: lecturer.id, userId: lecturer.userId, roleInCouncil: dto.roleInCouncil },
      include: { lecturer: { include: { user: true } }, user: true, council: true },
    }).catch((error) => {
      if (error?.code === 'P2002') {
        throw new AppException('COUNCIL_MEMBER_EXISTS', 'Giảng viên đã nằm trong hội đồng này', HttpStatus.CONFLICT);
      }
      throw error;
    });

    await this.audit(actor, 'COUNCIL_MEMBER_ADDED', member.id);
    await this.notificationsService.create({
      userId: lecturer.userId,
      title: 'Bạn được thêm vào hội đồng bảo vệ',
      message: `Bạn được phân công vai trò ${dto.roleInCouncil} trong ${council.name}.`,
      type: 'COUNCIL_MEMBER_ASSIGNED',
    });
    return member;
  }

  async updateMember(councilId: string, memberId: string, dto: UpdateCouncilMemberDto, actor: AuthUser) {
    await this.getCouncilOrThrow(councilId);
    const member = await this.prisma.councilMember.findFirst({ where: { id: memberId, councilId } });
    if (!member) throw new AppException('COUNCIL_MEMBER_NOT_FOUND', 'Không tìm thấy thành viên hội đồng', HttpStatus.NOT_FOUND);

    const lecturerId = dto.lecturerId ?? member.lecturerId;
    const roleInCouncil = dto.roleInCouncil ?? member.roleInCouncil;
    const lecturer = await this.prisma.lecturer.findUnique({ where: { id: lecturerId }, include: { user: true } });
    if (!lecturer) throw new AppException('LECTURER_NOT_FOUND', 'Không tìm thấy giảng viên', HttpStatus.NOT_FOUND);
    if (dto.roleInCouncil) await this.ensureUniqueChairSecretary(councilId, roleInCouncil, memberId);

    const updated = await this.prisma.councilMember.update({
      where: { id: memberId },
      data: { lecturerId, userId: lecturer.userId, roleInCouncil },
      include: { lecturer: { include: { user: true } }, council: true, user: true },
    });
    await this.audit(actor, 'COUNCIL_MEMBER_UPDATED', memberId);
    return updated;
  }

  async removeMember(councilId: string, memberId: string, actor: AuthUser) {
    const scheduleCount = await this.prisma.defenseSchedule.count({ where: { councilId, status: { not: DefenseScheduleStatus.CANCELLED } } });
    if (scheduleCount > 0) {
      throw new AppException('COUNCIL_MEMBER_REMOVE_BLOCKED', 'Không xóa thành viên khi hội đồng đã có lịch bảo vệ', HttpStatus.CONFLICT);
    }
    const member = await this.prisma.councilMember.findFirst({ where: { id: memberId, councilId } });
    if (!member) throw new AppException('COUNCIL_MEMBER_NOT_FOUND', 'Không tìm thấy thành viên hội đồng', HttpStatus.NOT_FOUND);
    await this.prisma.councilMember.delete({ where: { id: memberId } });
    await this.audit(actor, 'COUNCIL_MEMBER_REMOVED', memberId);
    return { id: memberId };
  }

  private include() {
    return {
      projectPeriod: true,
      faculty: true,
      createdBy: true,
      members: { include: { lecturer: { include: { user: true } }, user: true }, orderBy: { createdAt: 'asc' as const } },
      schedules: true,
    };
  }

  private async getCouncilOrThrow(id: string) {
    const council = await this.prisma.defenseCouncil.findUnique({ where: { id }, include: this.include() });
    if (!council) throw new AppException('COUNCIL_NOT_FOUND', 'Không tìm thấy hội đồng', HttpStatus.NOT_FOUND);
    return council;
  }

  private async ensureProjectPeriodExists(projectPeriodId: string) {
    const period = await this.prisma.projectPeriod.findUnique({ where: { id: projectPeriodId } });
    if (!period) throw new AppException('PROJECT_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đồ án', HttpStatus.NOT_FOUND);
  }

  private async ensureFacultyExists(facultyId: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) throw new AppException('FACULTY_NOT_FOUND', 'Không tìm thấy khoa', HttpStatus.NOT_FOUND);
  }

  private async ensureUniqueChairSecretary(councilId: string, role: CouncilRole, excludeMemberId?: string) {
    if (![CouncilRole.CHAIR, CouncilRole.SECRETARY].includes(role)) return;
    const existing = await this.prisma.councilMember.findFirst({
      where: { councilId, roleInCouncil: role, id: excludeMemberId ? { not: excludeMemberId } : undefined },
    });
    if (existing) {
      throw new AppException('COUNCIL_INVALID_ROLE', `Hội đồng chỉ được có một ${role}`, HttpStatus.CONFLICT);
    }
  }

  private ensureCouncilReadyForActivation(members: { roleInCouncil: CouncilRole }[]) {
    const hasChair = members.some((member) => member.roleInCouncil === CouncilRole.CHAIR);
    const hasSecretary = members.some((member) => member.roleInCouncil === CouncilRole.SECRETARY);
    if (!hasChair) throw new AppException('COUNCIL_CHAIR_REQUIRED', 'Hội đồng ACTIVE cần có chủ tịch', HttpStatus.BAD_REQUEST);
    if (!hasSecretary) throw new AppException('COUNCIL_SECRETARY_REQUIRED', 'Hội đồng ACTIVE cần có thư ký', HttpStatus.BAD_REQUEST);
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetType: 'DefenseCouncil',
      targetId,
      result: 'SUCCESS',
    });
  }
}
