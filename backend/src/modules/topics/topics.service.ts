import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditResult, Prisma, TopicStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { QueryTopicDto } from './dto/query-topic.dto';
import { RejectTopicDto } from './dto/reject-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query: QueryTopicDto = {}) {
    const where: Prisma.TopicWhereInput = this.buildWhere(query);

    return this.prisma.topic.findMany({
      where,
      include: this.topicInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublished(query: QueryTopicDto = {}) {
    const where: Prisma.TopicWhereInput = {
      ...this.buildWhere(query),
      status: TopicStatus.PUBLISHED,
    };

    return this.prisma.topic.findMany({
      where,
      include: this.topicInclude(),
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findMy(actor: AuthUser, query: QueryTopicDto = {}) {
    const lecturer = await this.getLecturerByUserId(actor.id);

    return this.prisma.topic.findMany({
      where: {
        ...this.buildWhere(query),
        supervisorId: lecturer.id,
      },
      include: this.topicInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: this.topicInclude(),
    });

    if (!topic) {
      throw new AppException('TOPIC_NOT_FOUND', 'Không tìm thấy đề tài', HttpStatus.NOT_FOUND);
    }

    return topic;
  }

  async create(dto: CreateTopicDto, actor: AuthUser) {
    const lecturer = await this.getLecturerByUserId(actor.id);
    await this.ensureProjectPeriodExists(dto.projectPeriodId);

    const topic = await this.prisma.topic.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        objectives: dto.objectives,
        expectedOutput: dto.expectedOutput,
        major: dto.major,
        maxStudents: dto.maxStudents,
        supervisorId: lecturer.id,
        projectPeriodId: dto.projectPeriodId,
        status: TopicStatus.DRAFT,
      },
      include: this.topicInclude(),
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TOPIC_CREATED',
      targetType: 'Topic',
      targetId: topic.id,
      result: AuditResult.SUCCESS,
    });

    return topic;
  }

  async update(id: string, dto: UpdateTopicDto, actor: AuthUser) {
    const topic = await this.findOne(id);
    await this.ensureTopicOwner(topic.supervisor.userId, actor);

    if (![TopicStatus.DRAFT, TopicStatus.SUBMITTED, TopicStatus.REJECTED].includes(topic.status)) {
      throw new AppException('TOPIC_INVALID_STATUS', 'Chỉ được sửa đề tài khi còn nháp, chờ duyệt hoặc bị từ chối', HttpStatus.CONFLICT);
    }

    if (dto.projectPeriodId) {
      await this.ensureProjectPeriodExists(dto.projectPeriodId);
    }

    const updated = await this.prisma.topic.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.objectives !== undefined ? { objectives: dto.objectives } : {}),
        ...(dto.expectedOutput !== undefined ? { expectedOutput: dto.expectedOutput } : {}),
        ...(dto.major !== undefined ? { major: dto.major } : {}),
        ...(dto.maxStudents !== undefined ? { maxStudents: dto.maxStudents } : {}),
        ...(dto.projectPeriodId !== undefined ? { projectPeriodId: dto.projectPeriodId } : {}),
        ...(topic.status === TopicStatus.REJECTED ? { status: TopicStatus.DRAFT, rejectionReason: null } : {}),
      },
      include: this.topicInclude(),
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TOPIC_UPDATED',
      targetType: 'Topic',
      targetId: updated.id,
      result: AuditResult.SUCCESS,
    });

    return updated;
  }

  async submit(id: string, actor: AuthUser) {
    const topic = await this.findOne(id);
    await this.ensureTopicOwner(topic.supervisor.userId, actor);

    if (![TopicStatus.DRAFT, TopicStatus.REJECTED].includes(topic.status)) {
      throw new AppException('TOPIC_INVALID_STATUS', 'Chỉ được gửi duyệt đề tài ở trạng thái nháp hoặc bị từ chối', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.topic.update({
      where: { id },
      data: { status: TopicStatus.SUBMITTED, rejectionReason: null },
      include: this.topicInclude(),
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TOPIC_SUBMITTED',
      targetType: 'Topic',
      targetId: updated.id,
      result: AuditResult.SUCCESS,
    });

    return updated;
  }

  async approve(id: string, actor: AuthUser) {
    const topic = await this.findOne(id);
    if (topic.status !== TopicStatus.SUBMITTED) {
      throw new AppException('TOPIC_INVALID_STATUS', 'Chỉ được duyệt đề tài ở trạng thái chờ duyệt', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.topic.update({
      where: { id },
      data: {
        status: TopicStatus.APPROVED,
        approvedById: actor.id,
        approvedAt: new Date(),
        rejectionReason: null,
      },
      include: this.topicInclude(),
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TOPIC_APPROVED',
      targetType: 'Topic',
      targetId: updated.id,
      result: AuditResult.SUCCESS,
    });

    return updated;
  }

  async reject(id: string, dto: RejectTopicDto, actor: AuthUser) {
    const topic = await this.findOne(id);
    if (![TopicStatus.SUBMITTED, TopicStatus.APPROVED].includes(topic.status)) {
      throw new AppException('TOPIC_INVALID_STATUS', 'Chỉ được từ chối đề tài đã gửi duyệt hoặc đã duyệt', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.topic.update({
      where: { id },
      data: {
        status: TopicStatus.REJECTED,
        rejectionReason: dto.rejectionReason.trim(),
        approvedById: null,
        approvedAt: null,
        publishedAt: null,
      },
      include: this.topicInclude(),
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TOPIC_REJECTED',
      targetType: 'Topic',
      targetId: updated.id,
      result: AuditResult.SUCCESS,
      reason: dto.rejectionReason,
    });

    return updated;
  }

  async publish(id: string, actor: AuthUser) {
    const topic = await this.findOne(id);
    if (topic.status !== TopicStatus.APPROVED) {
      throw new AppException('TOPIC_INVALID_STATUS', 'Chỉ đề tài đã được duyệt mới được công bố', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.topic.update({
      where: { id },
      data: {
        status: TopicStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: this.topicInclude(),
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'TOPIC_PUBLISHED',
      targetType: 'Topic',
      targetId: updated.id,
      result: AuditResult.SUCCESS,
    });

    return updated;
  }

  private buildWhere(query: QueryTopicDto): Prisma.TopicWhereInput {
    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.projectPeriodId ? { projectPeriodId: query.projectPeriodId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { major: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private topicInclude(): Prisma.TopicInclude {
    return {
      supervisor: {
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          faculty: true,
        },
      },
      projectPeriod: true,
      approvedBy: { select: { id: true, email: true, fullName: true } },
    };
  }

  private async getLecturerByUserId(userId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { userId } });
    if (!lecturer) {
      throw new AppException('LECTURER_NOT_FOUND', 'Tài khoản hiện tại chưa có hồ sơ giảng viên', HttpStatus.NOT_FOUND);
    }
    return lecturer;
  }

  private async ensureProjectPeriodExists(projectPeriodId: string) {
    const period = await this.prisma.projectPeriod.findUnique({ where: { id: projectPeriodId } });
    if (!period) {
      throw new AppException('PROJECT_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đồ án', HttpStatus.NOT_FOUND);
    }
  }

  private async ensureTopicOwner(supervisorUserId: string, actor: AuthUser) {
    if (actor.roles.includes('ADMIN')) return;
    if (supervisorUserId !== actor.id) {
      throw new AppException('TOPIC_FORBIDDEN_ACTION', 'Bạn chỉ được thao tác với đề tài do mình tạo', HttpStatus.FORBIDDEN);
    }
  }
}
