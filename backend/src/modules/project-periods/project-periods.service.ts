import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditResult, Prisma, ProjectPeriodStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectPeriodDto } from './dto/create-project-period.dto';
import { QueryProjectPeriodDto } from './dto/query-project-period.dto';
import { UpdateProjectPeriodDto } from './dto/update-project-period.dto';

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
        _count: { select: { eligibilities: true, topics: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const period = await this.prisma.projectPeriod.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, email: true, fullName: true } },
        _count: { select: { eligibilities: true, topics: true } },
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
    if (current.status === ProjectPeriodStatus.ARCHIVED) {
      throw new AppException('PROJECT_PERIOD_INVALID_STATUS', 'Không thể mở đợt đã lưu trữ', HttpStatus.CONFLICT);
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
    if (current.status === ProjectPeriodStatus.ARCHIVED) {
      throw new AppException('PROJECT_PERIOD_INVALID_STATUS', 'Không thể đóng đợt đã lưu trữ', HttpStatus.CONFLICT);
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
