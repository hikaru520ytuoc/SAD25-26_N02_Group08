import { Injectable } from '@nestjs/common';
import { AuditResult } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type CreateAuditLogInput = {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  result: AuditResult;
  reason?: string | null;
};

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        result: input.result,
        reason: input.reason,
      },
    });
  }

  async findAll(query?: { page?: number; limit?: number; action?: string }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;

    const where = query?.action
      ? {
          action: {
            contains: query.action,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total },
    };
  }
}
