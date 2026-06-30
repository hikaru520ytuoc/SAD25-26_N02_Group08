import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AcademicStatus, AuditResult, EligibilityStatus, Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../../common/exceptions/app.exception';
import {
  buildEligibilityReason,
  evaluateStudentEligibility,
  resolveEligibilityStatusFromEvaluation,
} from '../../common/utils/student-eligibility.util';
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
        include: { userRoles: { include: { role: true } }, student: true },
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
      include: { userRoles: { include: { role: true } }, student: true },
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

    const roles = dto.roleIds?.length ? await this.ensureRolesExist(dto.roleIds) : [];
    const isStudent = roles.some((role) => role.code === 'STUDENT');

    if (dto.studentProfile && !isStudent) {
      throw new AppException('STUDENT_ROLE_REQUIRED', 'Chỉ nhập hồ sơ sinh viên khi tài khoản có role STUDENT', HttpStatus.BAD_REQUEST);
    }

    if (isStudent && !dto.studentProfile) {
      throw new AppException(
        'STUDENT_PROFILE_REQUIRED',
        'Tài khoản STUDENT cần nhập hồ sơ sinh viên và dữ liệu điều kiện làm đồ án',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.studentProfile) {
      await this.ensureStudentProfileReferences(dto.studentProfile.facultyId, dto.studentProfile.projectPeriodId);
      const existingStudentCode = await this.prisma.student.findUnique({ where: { studentCode: dto.studentProfile.studentCode } });
      if (existingStudentCode) {
        throw new AppException('STUDENT_CODE_EXISTS', 'Mã sinh viên đã tồn tại', HttpStatus.CONFLICT);
      }
    }

    const saltRounds = Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'));
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
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
        include: { userRoles: { include: { role: true } }, student: true },
      });

      if (dto.studentProfile) {
        const profile = dto.studentProfile;
        const evaluation = evaluateStudentEligibility({
          internshipStatus: profile.internshipStatus,
          academicStatus: profile.academicStatus,
          completedCredits: profile.completedCredits,
          requiredCredits: profile.requiredCredits,
          gpa: profile.gpa,
          hasPrerequisiteDebt: Boolean(profile.hasPrerequisiteDebt),
          hasTuitionDebt: Boolean(profile.hasTuitionDebt),
          hasDisciplinaryAction: Boolean(profile.hasDisciplinaryAction),
        });
        const eligibilityStatus = resolveEligibilityStatusFromEvaluation(evaluation, undefined);
        const reason = buildEligibilityReason(profile.reason, evaluation);

        const student = await tx.student.create({
          data: {
            userId: createdUser.id,
            studentCode: profile.studentCode.trim(),
            className: profile.className.trim(),
            major: profile.major.trim(),
            facultyId: profile.facultyId,
            internshipStatus: profile.internshipStatus,
            completedCredits: profile.completedCredits,
            requiredCredits: profile.requiredCredits,
            gpa: profile.gpa,
            hasPrerequisiteDebt: Boolean(profile.hasPrerequisiteDebt),
            hasTuitionDebt: Boolean(profile.hasTuitionDebt),
            hasDisciplinaryAction: Boolean(profile.hasDisciplinaryAction),
          },
        });

        await tx.studentEligibility.create({
          data: {
            studentId: student.id,
            projectPeriodId: profile.projectPeriodId,
            internshipStatus: profile.internshipStatus,
            academicStatus: profile.academicStatus ?? AcademicStatus.ACTIVE,
            completedCredits: profile.completedCredits,
            requiredCredits: profile.requiredCredits,
            gpa: profile.gpa,
            hasPrerequisiteDebt: Boolean(profile.hasPrerequisiteDebt),
            hasTuitionDebt: Boolean(profile.hasTuitionDebt),
            hasDisciplinaryAction: Boolean(profile.hasDisciplinaryAction),
            eligibilityStatus,
            reason,
            checkedById: actor.id,
            checkedAt: new Date(),
          },
        });

        return tx.user.findUniqueOrThrow({
          where: { id: createdUser.id },
          include: { userRoles: { include: { role: true } }, student: true },
        });
      }

      return createdUser;
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: isStudent ? 'USER_STUDENT_CREATED_WITH_ELIGIBILITY' : 'USER_CREATED',
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
      include: { userRoles: { include: { role: true } }, student: true },
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
      include: { userRoles: { include: { role: true } }, student: true },
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
      include: { userRoles: { include: { role: true } }, student: true },
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
      include: { userRoles: { include: { role: true } }, student: true },
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
    const roles = await this.prisma.role.findMany({ where: { id: { in: uniqueRoleIds } } });
    if (roles.length !== uniqueRoleIds.length) {
      throw new AppException('ROLE_NOT_FOUND', 'Một hoặc nhiều role không tồn tại', HttpStatus.NOT_FOUND);
    }
    return roles;
  }

  private async ensureStudentProfileReferences(facultyId: string | undefined, projectPeriodId: string) {
    const period = await this.prisma.projectPeriod.findUnique({ where: { id: projectPeriodId } });
    if (!period) {
      throw new AppException('PROJECT_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đồ án để tạo điều kiện sinh viên', HttpStatus.NOT_FOUND);
    }

    if (facultyId) {
      const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
      if (!faculty) throw new AppException('FACULTY_NOT_FOUND', 'Không tìm thấy khoa của sinh viên', HttpStatus.NOT_FOUND);
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
    student?: {
      id: string;
      studentCode: string;
      className: string;
      major: string;
      completedCredits: number | null;
      requiredCredits: number | null;
      gpa: number | null;
      hasPrerequisiteDebt: boolean;
      hasTuitionDebt: boolean;
      hasDisciplinaryAction: boolean;
    } | null;
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
      student: user.student,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
