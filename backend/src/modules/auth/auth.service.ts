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
    const freshUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        student: true,
        lecturer: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!freshUser) return user;

    return this.toAuthUser(
      freshUser,
      freshUser.userRoles.map((userRole) => userRole.role.code),
    );
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

  private toAuthUser(user: User & { student?: any; lecturer?: any }, roles: string[]): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles,
      student: user.student
        ? {
            id: user.student.id,
            studentCode: user.student.studentCode,
            className: user.student.className,
            major: user.student.major,
            internshipStatus: user.student.internshipStatus,
            completedCredits: user.student.completedCredits,
            requiredCredits: user.student.requiredCredits,
            gpa: user.student.gpa,
            hasPrerequisiteDebt: user.student.hasPrerequisiteDebt,
            hasTuitionDebt: user.student.hasTuitionDebt,
            hasDisciplinaryAction: user.student.hasDisciplinaryAction,
          }
        : null,
      lecturer: user.lecturer
        ? {
            id: user.lecturer.id,
            lecturerCode: user.lecturer.lecturerCode,
            academicTitle: user.lecturer.academicRank,
            specialization: user.lecturer.department,
            maxStudents: user.lecturer.maxSupervisedStudents,
          }
        : null,
    };
  }
}
