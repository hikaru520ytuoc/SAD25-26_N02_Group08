import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditResult, Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const search = query?.search?.trim();

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { fullName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: { userRoles: { include: { role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => this.sanitizeUser(user)),
      meta: { page, limit, total },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'Không tìm thấy người dùng', HttpStatus.NOT_FOUND);
    }

    return this.sanitizeUser(user);
  }

  async create(dto: CreateUserDto, actor: AuthUser) {
    const email = dto.email.toLowerCase();
    const existed = await this.prisma.user.findUnique({ where: { email } });
    if (existed) {
      throw new AppException('USER_EMAIL_EXISTS', 'Email đã tồn tại', HttpStatus.CONFLICT);
    }

    if (dto.roleIds?.length) {
      await this.ensureRolesExist(dto.roleIds);
    }

    const saltRounds = Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'));
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash,
        userRoles: dto.roleIds?.length
          ? {
              create: dto.roleIds.map((roleId) => ({ roleId })),
            }
          : undefined,
      },
      include: { userRoles: { include: { role: true } } },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'USER_CREATED',
      targetType: 'User',
      targetId: user.id,
      result: AuditResult.SUCCESS,
    });

    return this.sanitizeUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthUser) {
    await this.findOne(id);

    if (dto.email) {
      const email = dto.email.toLowerCase();
      const existed = await this.prisma.user.findUnique({ where: { email } });
      if (existed && existed.id !== id) {
        throw new AppException('USER_EMAIL_EXISTS', 'Email đã tồn tại', HttpStatus.CONFLICT);
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.email) data.email = dto.email.toLowerCase();
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.password) {
      const saltRounds = Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'));
      data.passwordHash = await bcrypt.hash(dto.password, saltRounds);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { userRoles: { include: { role: true } } },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'USER_UPDATED',
      targetType: 'User',
      targetId: user.id,
      result: AuditResult.SUCCESS,
    });

    return this.sanitizeUser(user);
  }

  async lock(id: string, actor: AuthUser) {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.LOCKED },
      include: { userRoles: { include: { role: true } } },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'USER_LOCKED',
      targetType: 'User',
      targetId: user.id,
      result: AuditResult.SUCCESS,
    });

    return this.sanitizeUser(user);
  }

  async unlock(id: string, actor: AuthUser) {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE },
      include: { userRoles: { include: { role: true } } },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'USER_UNLOCKED',
      targetType: 'User',
      targetId: user.id,
      result: AuditResult.SUCCESS,
    });

    return this.sanitizeUser(user);
  }

  async assignRoles(id: string, dto: AssignRolesDto, actor: AuthUser) {
    await this.findOne(id);
    await this.ensureRolesExist(dto.roleIds);

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      this.prisma.userRole.createMany({
        data: [...new Set(dto.roleIds)].map((roleId) => ({ userId: id, roleId })),
        skipDuplicates: true,
      }),
    ]);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'USER_ROLES_ASSIGNED',
      targetType: 'User',
      targetId: user.id,
      result: AuditResult.SUCCESS,
    });

    return this.sanitizeUser(user);
  }

  private async ensureRolesExist(roleIds: string[]) {
    const uniqueRoleIds = [...new Set(roleIds)];
    const count = await this.prisma.role.count({ where: { id: { in: uniqueRoleIds } } });
    if (count !== uniqueRoleIds.length) {
      throw new AppException('ROLE_NOT_FOUND', 'Một hoặc nhiều role không tồn tại', HttpStatus.NOT_FOUND);
    }
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    userRoles?: { role: { id: string; code: string; name: string; description: string | null } }[];
  }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.userRoles?.map((userRole) => userRole.role) ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
