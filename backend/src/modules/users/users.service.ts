import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditResult, Prisma, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../../common/exceptions/app.exception';
import { evaluateStudentAcademicEligibility } from '../../common/utils/student-academic-eligibility.util';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateStudentProfileDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateStudentProfileDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private userInclude() {
    return {
      userRoles: { include: { role: true } },
      student: { include: { major: true, faculty: true } },
      lecturer: true,
    } satisfies Prisma.UserInclude;
  }

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const search = query?.search?.trim();

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { student: { studentCode: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: this.userInclude(),
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
    const user = await this.prisma.user.findUnique({ where: { id }, include: this.userInclude() });
    if (!user) throw new AppException('USER_NOT_FOUND', 'Không tìm thấy người dùng', HttpStatus.NOT_FOUND);
    return this.sanitizeUser(user);
  }

  async create(dto: CreateUserDto, actor: AuthUser) {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new AppException('USER_EMAIL_EXISTS', 'Email đã tồn tại', HttpStatus.CONFLICT);
    }

    const roles = dto.roleIds?.length ? await this.ensureRolesExist(dto.roleIds) : [];
    const isStudent = roles.some((role) => role.code === 'STUDENT');

    if (dto.studentProfile && !isStudent) {
      throw new AppException('STUDENT_ROLE_REQUIRED', 'Chỉ nhập hồ sơ sinh viên khi tài khoản có vai trò STUDENT', HttpStatus.BAD_REQUEST);
    }
    if (isStudent && !dto.studentProfile) {
      throw new AppException('STUDENT_PROFILE_REQUIRED', 'Tài khoản STUDENT cần có hồ sơ và dữ liệu học vụ', HttpStatus.BAD_REQUEST);
    }

    if (dto.studentProfile) {
      await this.validateStudentProfileReferences(dto.studentProfile.majorId, dto.studentProfile.facultyId);
      await this.ensureStudentCodeAvailable(dto.studentProfile.studentCode);
    }

    const saltRounds = Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'));
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          fullName: dto.fullName.trim(),
          phone: dto.phone?.trim() || null,
          passwordHash,
          userRoles: dto.roleIds?.length ? { create: dto.roleIds.map((roleId) => ({ roleId })) } : undefined,
        },
      });

      if (dto.studentProfile) {
        const profile = dto.studentProfile;
        await tx.student.create({
          data: {
            userId: created.id,
            studentCode: profile.studentCode.trim(),
            className: profile.className.trim(),
            majorId: profile.majorId,
            facultyId: profile.facultyId,
            internshipStatus: profile.internshipStatus,
            academicStatus: profile.academicStatus,
            accumulatedCredits: profile.accumulatedCredits,
            gpa: profile.gpa,
            hasPrerequisiteDebt: Boolean(profile.hasPrerequisiteDebt),
            hasTuitionDebt: Boolean(profile.hasTuitionDebt),
            hasDisciplinaryAction: Boolean(profile.hasDisciplinaryAction),
          },
        });
      }

      return tx.user.findUniqueOrThrow({ where: { id: created.id }, include: this.userInclude() });
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: isStudent ? 'USER_STUDENT_CREATED' : 'USER_CREATED',
      targetType: 'User',
      targetId: user.id,
      result: AuditResult.SUCCESS,
    });

    return this.sanitizeUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthUser) {
    const existing = await this.prisma.user.findUnique({ where: { id }, include: this.userInclude() });
    if (!existing) throw new AppException('USER_NOT_FOUND', 'Không tìm thấy người dùng', HttpStatus.NOT_FOUND);

    if (dto.email) {
      const duplicate = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (duplicate && duplicate.id !== id) {
        throw new AppException('USER_EMAIL_EXISTS', 'Email đã tồn tại', HttpStatus.CONFLICT);
      }
    }

    let nextRoles: Role[] | undefined;
    if (dto.roleIds) {
      const assignedRoles = await this.ensureRolesExist(dto.roleIds);
      nextRoles = assignedRoles;
      const keepsAdmin = assignedRoles.some((role) => role.code === 'ADMIN');
      const currentlyAdmin = existing.userRoles.some((item) => item.role.code === 'ADMIN');
      if (id === actor.id && currentlyAdmin && !keepsAdmin) {
        throw new AppException('CANNOT_REMOVE_OWN_ADMIN_ROLE', 'Không thể tự gỡ vai trò quản trị viên của tài khoản đang đăng nhập', HttpStatus.BAD_REQUEST);
      }
      if (currentlyAdmin && !keepsAdmin) await this.ensureAnotherActiveAdminExists(id);
    }

    const willBeStudent = (nextRoles ?? existing.userRoles.map((item) => item.role)).some((role) => role.code === 'STUDENT');
    if (dto.studentProfile && !willBeStudent) {
      throw new AppException('STUDENT_ROLE_REQUIRED', 'Chỉ cập nhật hồ sơ sinh viên khi tài khoản có vai trò STUDENT', HttpStatus.BAD_REQUEST);
    }
    if (willBeStudent && !existing.student && !dto.studentProfile) {
      throw new AppException('STUDENT_PROFILE_REQUIRED', 'Cần nhập hồ sơ sinh viên khi thêm vai trò STUDENT', HttpStatus.BAD_REQUEST);
    }

    if (dto.studentProfile) {
      await this.validateStudentProfileReferences(dto.studentProfile.majorId, dto.studentProfile.facultyId);
      if (dto.studentProfile.studentCode) await this.ensureStudentCodeAvailable(dto.studentProfile.studentCode, existing.student?.id);
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.email) data.email = dto.email.toLowerCase();
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) data.phone = dto.phone.trim() || null;
    if (dto.password) {
      const saltRounds = Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'));
      data.passwordHash = await bcrypt.hash(dto.password, saltRounds);
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data });

      if (dto.roleIds) {
        const uniqueRoleIds = [...new Set(dto.roleIds)];
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({ data: uniqueRoleIds.map((roleId) => ({ userId: id, roleId })), skipDuplicates: true });
      }

      if (dto.studentProfile) {
        if (existing.student) {
          const profile = dto.studentProfile;
          await tx.student.update({
            where: { id: existing.student.id },
            data: {
              ...(profile.studentCode !== undefined ? { studentCode: profile.studentCode.trim() } : {}),
              ...(profile.className !== undefined ? { className: profile.className.trim() } : {}),
              ...(profile.majorId !== undefined ? { majorId: profile.majorId } : {}),
              ...(profile.facultyId !== undefined ? { facultyId: profile.facultyId } : {}),
              ...(profile.internshipStatus !== undefined ? { internshipStatus: profile.internshipStatus } : {}),
              ...(profile.academicStatus !== undefined ? { academicStatus: profile.academicStatus } : {}),
              ...(profile.accumulatedCredits !== undefined ? { accumulatedCredits: profile.accumulatedCredits } : {}),
              ...(profile.gpa !== undefined ? { gpa: profile.gpa } : {}),
              ...(profile.hasPrerequisiteDebt !== undefined ? { hasPrerequisiteDebt: profile.hasPrerequisiteDebt } : {}),
              ...(profile.hasTuitionDebt !== undefined ? { hasTuitionDebt: profile.hasTuitionDebt } : {}),
              ...(profile.hasDisciplinaryAction !== undefined ? { hasDisciplinaryAction: profile.hasDisciplinaryAction } : {}),
            },
          });
        } else {
          const profile = this.requireCompleteStudentProfile(dto.studentProfile);
          await tx.student.create({
            data: {
              userId: id,
              studentCode: profile.studentCode.trim(),
              className: profile.className.trim(),
              majorId: profile.majorId,
              facultyId: profile.facultyId,
              internshipStatus: profile.internshipStatus,
              academicStatus: profile.academicStatus,
              accumulatedCredits: profile.accumulatedCredits,
              gpa: profile.gpa,
              hasPrerequisiteDebt: Boolean(profile.hasPrerequisiteDebt),
              hasTuitionDebt: Boolean(profile.hasTuitionDebt),
              hasDisciplinaryAction: Boolean(profile.hasDisciplinaryAction),
            },
          });
        }
      }

      return tx.user.findUniqueOrThrow({ where: { id }, include: this.userInclude() });
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: dto.studentProfile ? 'USER_AND_STUDENT_PROFILE_UPDATED' : dto.roleIds ? 'USER_PROFILE_AND_ROLES_UPDATED' : 'USER_UPDATED',
      targetType: 'User',
      targetId: user.id,
      result: AuditResult.SUCCESS,
    });

    return this.sanitizeUser(user);
  }

  async lock(id: string, actor: AuthUser) {
    if (id === actor.id) throw new AppException('CANNOT_LOCK_CURRENT_ACCOUNT', 'Bạn không thể khóa tài khoản đang đăng nhập', HttpStatus.BAD_REQUEST);
    const existing = await this.prisma.user.findUnique({ where: { id }, include: this.userInclude() });
    if (!existing) throw new AppException('USER_NOT_FOUND', 'Không tìm thấy người dùng', HttpStatus.NOT_FOUND);
    if (existing.status === UserStatus.LOCKED) return this.sanitizeUser(existing);
    if (existing.userRoles.some((item) => item.role.code === 'ADMIN')) await this.ensureAnotherActiveAdminExists(id);

    const user = await this.prisma.user.update({ where: { id }, data: { status: UserStatus.LOCKED }, include: this.userInclude() });
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action: 'USER_LOCKED', targetType: 'User', targetId: id, result: AuditResult.SUCCESS });
    return this.sanitizeUser(user);
  }

  async unlock(id: string, actor: AuthUser) {
    const existing = await this.prisma.user.findUnique({ where: { id }, include: this.userInclude() });
    if (!existing) throw new AppException('USER_NOT_FOUND', 'Không tìm thấy người dùng', HttpStatus.NOT_FOUND);
    if (existing.status === UserStatus.ACTIVE) return this.sanitizeUser(existing);

    const user = await this.prisma.user.update({ where: { id }, data: { status: UserStatus.ACTIVE }, include: this.userInclude() });
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action: 'USER_UNLOCKED', targetType: 'User', targetId: id, result: AuditResult.SUCCESS });
    return this.sanitizeUser(user);
  }

  async assignRoles(id: string, dto: AssignRolesDto, actor: AuthUser) {
    const existing = await this.prisma.user.findUnique({ where: { id }, include: { userRoles: { include: { role: true } }, student: true } });
    if (!existing) throw new AppException('USER_NOT_FOUND', 'Không tìm thấy người dùng', HttpStatus.NOT_FOUND);

    const nextRoles = await this.ensureRolesExist(dto.roleIds);
    const currentlyAdmin = existing.userRoles.some((item) => item.role.code === 'ADMIN');
    const keepsAdmin = nextRoles.some((role) => role.code === 'ADMIN');
    const addsStudent = nextRoles.some((role) => role.code === 'STUDENT') && !existing.student;
    if (addsStudent) {
      throw new AppException('STUDENT_PROFILE_REQUIRED', 'Hãy dùng chức năng Sửa để nhập hồ sơ trước khi thêm vai trò STUDENT', HttpStatus.BAD_REQUEST);
    }
    if (id === actor.id && currentlyAdmin && !keepsAdmin) {
      throw new AppException('CANNOT_REMOVE_OWN_ADMIN_ROLE', 'Không thể tự gỡ vai trò quản trị viên của tài khoản đang đăng nhập', HttpStatus.BAD_REQUEST);
    }
    if (currentlyAdmin && !keepsAdmin) await this.ensureAnotherActiveAdminExists(id);

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      this.prisma.userRole.createMany({ data: [...new Set(dto.roleIds)].map((roleId) => ({ userId: id, roleId })), skipDuplicates: true }),
    ]);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id }, include: this.userInclude() });
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action: 'USER_ROLES_ASSIGNED', targetType: 'User', targetId: id, result: AuditResult.SUCCESS });
    return this.sanitizeUser(user);
  }

  private async ensureRolesExist(roleIds: string[]) {
    const uniqueRoleIds = [...new Set(roleIds)];
    const roles = await this.prisma.role.findMany({ where: { id: { in: uniqueRoleIds } } });
    if (roles.length !== uniqueRoleIds.length) throw new AppException('ROLE_NOT_FOUND', 'Một hoặc nhiều role không tồn tại', HttpStatus.NOT_FOUND);
    return roles;
  }

  private async ensureAnotherActiveAdminExists(excludedUserId: string) {
    const count = await this.prisma.user.count({
      where: { id: { not: excludedUserId }, status: UserStatus.ACTIVE, userRoles: { some: { role: { code: 'ADMIN' } } } },
    });
    if (count === 0) {
      throw new AppException('LAST_ACTIVE_ADMIN_REQUIRED', 'Không thể khóa hoặc gỡ quyền của quản trị viên hoạt động cuối cùng', HttpStatus.BAD_REQUEST);
    }
  }

  private async validateStudentProfileReferences(majorId?: string, facultyId?: string) {
    if (majorId && !(await this.prisma.major.findUnique({ where: { id: majorId } }))) {
      throw new AppException('MAJOR_NOT_FOUND', 'Không tìm thấy ngành học', HttpStatus.NOT_FOUND);
    }
    if (facultyId && !(await this.prisma.faculty.findUnique({ where: { id: facultyId } }))) {
      throw new AppException('FACULTY_NOT_FOUND', 'Không tìm thấy khoa của sinh viên', HttpStatus.NOT_FOUND);
    }
  }

  private async ensureStudentCodeAvailable(studentCode: string, excludedStudentId?: string) {
    const existing = await this.prisma.student.findUnique({ where: { studentCode: studentCode.trim() } });
    if (existing && existing.id !== excludedStudentId) {
      throw new AppException('STUDENT_CODE_EXISTS', 'Mã sinh viên đã tồn tại', HttpStatus.CONFLICT);
    }
  }

  private requireCompleteStudentProfile(profile: UpdateStudentProfileDto): CreateStudentProfileDto {
    const required = ['studentCode', 'className', 'majorId', 'internshipStatus', 'academicStatus', 'accumulatedCredits', 'gpa'] as const;
    const missing = required.filter((field) => profile[field] === undefined || profile[field] === null || profile[field] === '');
    if (missing.length) {
      throw new AppException('STUDENT_PROFILE_INCOMPLETE', 'Hồ sơ sinh viên chưa đầy đủ', HttpStatus.BAD_REQUEST);
    }
    return profile as CreateStudentProfileDto;
  }

  private sanitizeUser(user: any) {
    const student = user.student
      ? {
          id: user.student.id,
          studentCode: user.student.studentCode,
          className: user.student.className,
          majorId: user.student.majorId,
          major: user.student.major,
          facultyId: user.student.facultyId,
          faculty: user.student.faculty,
          internshipStatus: user.student.internshipStatus,
          academicStatus: user.student.academicStatus,
          accumulatedCredits: user.student.accumulatedCredits,
          gpa: user.student.gpa,
          hasPrerequisiteDebt: user.student.hasPrerequisiteDebt,
          hasTuitionDebt: user.student.hasTuitionDebt,
          hasDisciplinaryAction: user.student.hasDisciplinaryAction,
          eligibility: evaluateStudentAcademicEligibility({
            major: user.student.major,
            accumulatedCredits: user.student.accumulatedCredits,
            gpa: user.student.gpa,
            internshipStatus: user.student.internshipStatus,
            academicStatus: user.student.academicStatus,
            hasPrerequisiteDebt: user.student.hasPrerequisiteDebt,
            hasTuitionDebt: user.student.hasTuitionDebt,
            hasDisciplinaryAction: user.student.hasDisciplinaryAction,
            userStatus: user.status,
          }),
        }
      : null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.userRoles?.map((item: any) => item.role) ?? [],
      student,
      lecturer: user.lecturer,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
