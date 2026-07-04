import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditResult, Prisma, ProjectPeriodStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectPeriodDto } from './dto/create-project-period.dto';
import { QueryProjectPeriodDto } from './dto/query-project-period.dto';
import { UpdateProjectPeriodDto } from './dto/update-project-period.dto';
import { ExtendProjectPeriodDto, ProjectPeriodExtensionType } from './dto/extend-project-period.dto';

@Injectable()
export class ProjectPeriodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query: QueryProjectPeriodDto = {}) {
    const where: Prisma.ProjectPeriodWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { academicYear: { contains: query.search, mode: 'insensitive' } },
              { semester: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.projectPeriod.findMany({
      where,
      include: {
        createdBy: { select: { id: true, email: true, fullName: true } },
        supervisorAssignments: { where: { status: 'ACTIVE' }, select: { supervisorId: true } },
        _count: { select: { projectPeriodRegistrations: true, topics: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).then((periods) => periods.map(({ supervisorAssignments, ...period }) => ({
      ...period,
      statistics: {
        students: period._count.projectPeriodRegistrations,
        topics: period._count.topics,
        supervisors: new Set(supervisorAssignments.map((item) => item.supervisorId)).size,
      },
    })));
  }

  async findOne(id: string) {
    const period = await this.prisma.projectPeriod.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, email: true, fullName: true } },
        _count: { select: { projectPeriodRegistrations: true, topics: true } },
      },
    });

    if (!period) {
      throw new AppException('PROJECT_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đồ án', HttpStatus.NOT_FOUND);
    }

    return period;
  }

  async create(dto: CreateProjectPeriodDto, actor: AuthUser) {
    this.validateDateRange(dto.startDate, dto.endDate);
    this.validateRegistrationDateRange(dto.registrationStartDate, dto.registrationEndDate);
    this.validateRegistrationWithinPeriod(dto.startDate, dto.endDate, dto.registrationStartDate, dto.registrationEndDate);

    const period = await this.prisma.projectPeriod.create({
      data: {
        name: dto.name.trim(),
        academicYear: dto.academicYear.trim(),
        semester: dto.semester.trim(),
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        registrationStartDate: dto.registrationStartDate ? new Date(dto.registrationStartDate) : null,
        registrationEndDate: dto.registrationEndDate ? new Date(dto.registrationEndDate) : null,
        createdById: actor.id,
      },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROJECT_PERIOD_CREATED',
      targetType: 'ProjectPeriod',
      targetId: period.id,
      result: AuditResult.SUCCESS,
    });

    return period;
  }

  async update(id: string, dto: UpdateProjectPeriodDto, actor: AuthUser) {
    const current = await this.findOne(id);

    if (current.status === ProjectPeriodStatus.ARCHIVED) {
      throw new AppException('PROJECT_PERIOD_INVALID_STATUS', 'Không thể cập nhật đợt đã lưu trữ', HttpStatus.CONFLICT);
    }

    const startDate = dto.startDate ?? current.startDate.toISOString();
    const endDate = dto.endDate ?? current.endDate.toISOString();
    this.validateDateRange(startDate, endDate);

    const registrationStartDate = dto.registrationStartDate ?? current.registrationStartDate?.toISOString();
    const registrationEndDate = dto.registrationEndDate ?? current.registrationEndDate?.toISOString();
    this.validateRegistrationDateRange(registrationStartDate, registrationEndDate);
    this.validateRegistrationWithinPeriod(startDate, endDate, registrationStartDate, registrationEndDate);

    const period = await this.prisma.projectPeriod.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.academicYear !== undefined ? { academicYear: dto.academicYear.trim() } : {}),
        ...(dto.semester !== undefined ? { semester: dto.semester.trim() } : {}),
        ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate !== undefined ? { endDate: new Date(dto.endDate) } : {}),
        ...(dto.registrationStartDate !== undefined
          ? { registrationStartDate: new Date(dto.registrationStartDate) }
          : {}),
        ...(dto.registrationEndDate !== undefined
          ? { registrationEndDate: new Date(dto.registrationEndDate) }
          : {}),
      },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROJECT_PERIOD_UPDATED',
      targetType: 'ProjectPeriod',
      targetId: period.id,
      result: AuditResult.SUCCESS,
    });

    return period;
  }

  async open(id: string, actor: AuthUser) {
    const current = await this.findOne(id);
    if (![ProjectPeriodStatus.DRAFT, ProjectPeriodStatus.CLOSED].includes(current.status)) {
      throw new AppException('PROJECT_PERIOD_INVALID_STATUS', 'Chỉ có thể mở đợt đang ở trạng thái bản nháp hoặc đã đóng', HttpStatus.CONFLICT);
    }

    const period = await this.prisma.projectPeriod.update({
      where: { id },
      data: { status: ProjectPeriodStatus.OPEN },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROJECT_PERIOD_OPENED',
      targetType: 'ProjectPeriod',
      targetId: period.id,
      result: AuditResult.SUCCESS,
    });

    return period;
  }

  async close(id: string, actor: AuthUser) {
    const current = await this.findOne(id);
    if (current.status !== ProjectPeriodStatus.OPEN) {
      throw new AppException('PROJECT_PERIOD_INVALID_STATUS', 'Chỉ có thể đóng đợt đang mở', HttpStatus.CONFLICT);
    }

    const period = await this.prisma.projectPeriod.update({
      where: { id },
      data: { status: ProjectPeriodStatus.CLOSED },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROJECT_PERIOD_CLOSED',
      targetType: 'ProjectPeriod',
      targetId: period.id,
      result: AuditResult.SUCCESS,
    });

    return period;
  }

  async findStudents(id: string) {
    await this.findOne(id);
    const registrations = await this.prisma.projectPeriodRegistration.findMany({
      where: { projectPeriodId: id },
      include: {
        student: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            major: { select: { code: true, name: true } },
            faculty: { select: { code: true, name: true } },
            topicRegistrations: {
              where: { projectPeriodId: id },
              include: {
                topic: { select: { id: true, title: true } },
                requestedSupervisor: { include: { user: { select: { fullName: true } } } },
                supervisorAssignment: { include: { supervisor: { include: { user: { select: { fullName: true } } } } } },
                outline: { select: { status: true } },
                defenseRegistration: { select: { status: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            finalResults: { where: { projectPeriodId: id }, select: { resultStatus: true, publicationStatus: true }, take: 1 },
            archiveRecords: { where: { projectPeriodId: id }, select: { status: true }, take: 1 },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    return registrations.map((registration) => {
      const topicRegistration = registration.student.topicRegistrations[0];
      const currentStage = registration.student.archiveRecords[0]?.status === 'LOCKED' ? 'Đã khóa hồ sơ'
        : registration.student.archiveRecords[0] ? 'Lưu trữ'
        : registration.student.finalResults[0] ? 'Kết quả'
        : topicRegistration?.defenseRegistration ? 'Bảo vệ'
        : topicRegistration?.outline ? 'Đề cương/tiến độ'
        : topicRegistration ? 'Đăng ký đề tài'
        : 'Đăng ký đợt';
      return { ...registration, currentStage, topicRegistration };
    });
  }

  async findTopics(id: string) {
    await this.findOne(id);
    const topics = await this.prisma.topic.findMany({
      where: { projectPeriodId: id },
      include: {
        supervisor: { include: { user: { select: { fullName: true, email: true } } } },
        topicRegistrations: { select: { status: true, student: { include: { user: { select: { fullName: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return topics.map((topic) => ({
      ...topic,
      registrationCount: topic.topicRegistrations.filter((item) => !['CANCELLED', 'FACULTY_REJECTED'].includes(item.status)).length,
      approvedCount: topic.topicRegistrations.filter((item) => ['FACULTY_APPROVED', 'OFFICIALLY_ASSIGNED'].includes(item.status)).length,
    }));
  }

  async extend(id: string, dto: ExtendProjectPeriodDto, actor: AuthUser) {
    const current = await this.findOne(id);
    if (current.status === ProjectPeriodStatus.ARCHIVED) throw new AppException('PROJECT_PERIOD_INVALID_STATUS', 'Không thể gia hạn đợt đã lưu trữ', HttpStatus.CONFLICT);

    const changes: { endDate?: Date; registrationEndDate?: Date } = {};
    if ([ProjectPeriodExtensionType.PERIOD, ProjectPeriodExtensionType.BOTH].includes(dto.type)) {
      if (!dto.endDate) throw new AppException('PROJECT_PERIOD_END_DATE_REQUIRED', 'Vui lòng chọn ngày kết thúc đợt mới', HttpStatus.BAD_REQUEST);
      if (new Date(dto.endDate) <= current.endDate) throw new AppException('PROJECT_PERIOD_EXTENSION_INVALID', 'Ngày kết thúc mới phải sau ngày hiện tại', HttpStatus.BAD_REQUEST);
      changes.endDate = new Date(dto.endDate);
    }
    if ([ProjectPeriodExtensionType.REGISTRATION, ProjectPeriodExtensionType.BOTH].includes(dto.type)) {
      if (!dto.registrationEndDate) throw new AppException('REGISTRATION_END_DATE_REQUIRED', 'Vui lòng chọn ngày kết thúc đăng ký mới', HttpStatus.BAD_REQUEST);
      if (current.registrationEndDate && new Date(dto.registrationEndDate) <= current.registrationEndDate) throw new AppException('PROJECT_PERIOD_EXTENSION_INVALID', 'Ngày kết thúc đăng ký mới phải sau ngày hiện tại', HttpStatus.BAD_REQUEST);
      changes.registrationEndDate = new Date(dto.registrationEndDate);
    }

    const endDate = changes.endDate ?? current.endDate;
    const registrationEndDate = changes.registrationEndDate ?? current.registrationEndDate;
    this.validateRegistrationWithinPeriod(current.startDate.toISOString(), endDate.toISOString(), current.registrationStartDate?.toISOString(), registrationEndDate?.toISOString());
    const updated = await this.prisma.projectPeriod.update({ where: { id }, data: changes });

    if (dto.notifyUsers !== false) {
      const users = await this.prisma.projectPeriodRegistration.findMany({ where: { projectPeriodId: id, status: 'REGISTERED' }, select: { student: { select: { userId: true } } } });
      if (users.length) await this.prisma.notification.createMany({ data: users.map((item) => ({ userId: item.student.userId, title: 'Đợt đồ án đã được gia hạn', message: `${current.name} đã được gia hạn. Lý do: ${dto.reason.trim()}`, type: 'PROJECT_PERIOD_EXTENDED' })) });
    }

    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action: 'PROJECT_PERIOD_EXTENDED', targetType: 'ProjectPeriod', targetId: id, result: AuditResult.SUCCESS, reason: dto.reason.trim() });
    return updated;
  }

  async removeDraft(id: string, actor: AuthUser) {
    const current = await this.findOne(id);
    if (current.status !== ProjectPeriodStatus.DRAFT) throw new AppException('PROJECT_PERIOD_INVALID_STATUS', 'Chỉ được xóa đợt ở trạng thái bản nháp', HttpStatus.CONFLICT);
    const dependencyCount = await this.prisma.projectPeriodRegistration.count({ where: { projectPeriodId: id } }) + await this.prisma.topic.count({ where: { projectPeriodId: id } });
    if (dependencyCount > 0) throw new AppException('PROJECT_PERIOD_HAS_DATA', 'Không thể xóa đợt đã có sinh viên hoặc đề tài', HttpStatus.CONFLICT);
    await this.prisma.projectPeriod.delete({ where: { id } });
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action: 'PROJECT_PERIOD_DRAFT_DELETED', targetType: 'ProjectPeriod', targetId: id, result: AuditResult.SUCCESS });
    return { id };
  }

  private validateRegistrationWithinPeriod(startDate: string, endDate: string, registrationStartDate?: string, registrationEndDate?: string) {
    const periodStart = new Date(startDate).getTime();
    const periodEnd = new Date(endDate).getTime();
    if (registrationStartDate && new Date(registrationStartDate).getTime() < periodStart) throw new AppException('PROJECT_PERIOD_INVALID_DATE', 'Ngày bắt đầu đăng ký phải nằm trong thời gian đợt', HttpStatus.BAD_REQUEST);
    if (registrationEndDate && new Date(registrationEndDate).getTime() > periodEnd) throw new AppException('PROJECT_PERIOD_INVALID_DATE', 'Ngày kết thúc đăng ký phải nằm trong thời gian đợt', HttpStatus.BAD_REQUEST);
  }

  private validateDateRange(startDate: string, endDate: string) {
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      throw new AppException('PROJECT_PERIOD_INVALID_DATE', 'Ngày bắt đầu không được sau ngày kết thúc', HttpStatus.BAD_REQUEST);
    }
  }

  private validateRegistrationDateRange(startDate?: string, endDate?: string) {
    if (startDate && endDate && new Date(startDate).getTime() > new Date(endDate).getTime()) {
      throw new AppException('PROJECT_PERIOD_INVALID_DATE', 'Ngày bắt đầu đăng ký không được sau ngày kết thúc đăng ký', HttpStatus.BAD_REQUEST);
    }
  }
}
