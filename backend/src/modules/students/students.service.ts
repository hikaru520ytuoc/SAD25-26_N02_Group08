import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, ProjectPeriodRegistrationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { evaluateStudentAcademicEligibility } from '../../common/utils/student-academic-eligibility.util';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async academicEligibilityOverview(query?: { search?: string; majorCode?: string; eligible?: boolean }) {
    const search = query?.search?.trim();
    const where: Prisma.StudentWhereInput = {
      ...(query?.majorCode ? { major: { code: query.majorCode } } : {}),
      ...(search
        ? {
            OR: [
              { studentCode: { contains: search, mode: 'insensitive' } },
              { className: { contains: search, mode: 'insensitive' } },
              { user: { fullName: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { major: { code: { contains: search, mode: 'insensitive' } } },
              { major: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const students = await this.prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true, status: true } },
        major: true,
        faculty: true,
        projectPeriodRegistrations: {
          where: { status: ProjectPeriodRegistrationStatus.REGISTERED },
          include: { projectPeriod: true },
          take: 1,
        },
      },
      orderBy: { studentCode: 'asc' },
    });

    const items = students.map((student) => this.toAcademicEligibility(student));
    return query?.eligible === undefined ? items : items.filter((item) => item.eligibility.eligible === query.eligible);
  }

  async myAcademicEligibility(actor: AuthUser) {
    const student = await this.prisma.student.findUnique({
      where: { userId: actor.id },
      include: {
        user: { select: { id: true, email: true, fullName: true, status: true } },
        major: true,
        faculty: true,
        projectPeriodRegistrations: {
          where: { status: ProjectPeriodRegistrationStatus.REGISTERED },
          include: { projectPeriod: true },
          take: 1,
        },
      },
    });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Tài khoản hiện tại chưa có hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    return this.toAcademicEligibility(student);
  }

  private toAcademicEligibility(student: any) {
    const eligibility = evaluateStudentAcademicEligibility({
      major: student.major,
      accumulatedCredits: student.accumulatedCredits,
      gpa: student.gpa,
      internshipStatus: student.internshipStatus,
      academicStatus: student.academicStatus,
      hasPrerequisiteDebt: student.hasPrerequisiteDebt,
      hasTuitionDebt: student.hasTuitionDebt,
      hasDisciplinaryAction: student.hasDisciplinaryAction,
      userStatus: student.user.status,
    });

    return {
      id: student.id,
      studentCode: student.studentCode,
      className: student.className,
      user: student.user,
      major: student.major,
      faculty: student.faculty,
      internshipStatus: student.internshipStatus,
      academicStatus: student.academicStatus,
      accumulatedCredits: student.accumulatedCredits,
      gpa: student.gpa,
      hasPrerequisiteDebt: student.hasPrerequisiteDebt,
      hasTuitionDebt: student.hasTuitionDebt,
      hasDisciplinaryAction: student.hasDisciplinaryAction,
      eligibility,
      activeProjectPeriodRegistration: student.projectPeriodRegistrations[0] ?? null,
      updatedAt: student.updatedAt,
    };
  }
}
