import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditResult, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async login(dto: LoginDto, meta?: { ipAddress?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      await this.logLoginFailed(dto.email, 'Email không tồn tại', meta);
      throw new AppException(
        'AUTH_INVALID_CREDENTIALS',
        'Email hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status === UserStatus.LOCKED) {
      await this.auditLogsService.create({
        actorId: user.id,
        actorEmail: user.email,
        action: 'LOGIN_FAILED',
        result: AuditResult.FAILED,
        reason: 'Tài khoản bị khóa',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new AppException('AUTH_ACCOUNT_LOCKED', 'Tài khoản đã bị khóa', HttpStatus.FORBIDDEN);
    }

    const passwordMatched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatched) {
      await this.auditLogsService.create({
        actorId: user.id,
        actorEmail: user.email,
        action: 'LOGIN_FAILED',
        result: AuditResult.FAILED,
        reason: 'Sai mật khẩu',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new AppException(
        'AUTH_INVALID_CREDENTIALS',
        'Email hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const roles = user.userRoles.map((userRole) => userRole.role.code);
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
      },
    );

    await this.auditLogsService.create({
      actorId: user.id,
      actorEmail: user.email,
      action: 'LOGIN_SUCCESS',
      result: AuditResult.SUCCESS,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      accessToken,
      user: this.toAuthUser(user, roles),
    };
  }

  async getMe(user: AuthUser) {
    return user;
  }

  private async logLoginFailed(
    email: string,
    reason: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    await this.auditLogsService.create({
      actorEmail: email.toLowerCase(),
      action: 'LOGIN_FAILED',
      result: AuditResult.FAILED,
      reason,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
  }

  private toAuthUser(user: User, roles: string[]): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roles,
    };
  }
}
