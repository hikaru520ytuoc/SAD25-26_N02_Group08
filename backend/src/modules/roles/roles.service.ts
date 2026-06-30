import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditResult } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { userRoles: true } } },
    });
  }

  async create(dto: CreateRoleDto, actor: AuthUser) {
    const code = dto.code.trim().toUpperCase();
    const existed = await this.prisma.role.findUnique({ where: { code } });
    if (existed) {
      throw new AppException('ROLE_CODE_EXISTS', 'Mã role đã tồn tại', HttpStatus.CONFLICT);
    }

    const role = await this.prisma.role.create({
      data: {
        code,
        name: dto.name,
        description: dto.description,
      },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'ROLE_CREATED',
      targetType: 'Role',
      targetId: role.id,
      result: AuditResult.SUCCESS,
    });

    return role;
  }

  async update(id: string, dto: UpdateRoleDto, actor: AuthUser) {
    const existed = await this.prisma.role.findUnique({ where: { id } });
    if (!existed) {
      throw new AppException('ROLE_NOT_FOUND', 'Không tìm thấy role', HttpStatus.NOT_FOUND);
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'ROLE_UPDATED',
      targetType: 'Role',
      targetId: role.id,
      result: AuditResult.SUCCESS,
    });

    return role;
  }
}
