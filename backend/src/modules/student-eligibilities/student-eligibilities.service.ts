import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AcademicStatus,
  AuditResult,
  EligibilityStatus,
  InternshipStatus,
  Prisma,
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import {
  buildEligibilityReason,
  evaluateStudentEligibility,
  resolveEligibilityStatusFromEvaluation,
  StudentEligibilityEvaluationInput,
} from '../../common/utils/student-eligibility.util';
import { AuthUser } from '../../common/types/auth-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentEligibilityDto } from './dto/create-student-eligibility.dto';
import { QueryStudentEligibilityDto } from './dto/query-student-eligibility.dto';
import { UpdateStudentEligibilityDto } from './dto/update-student-eligibility.dto';

@Injectable()
export class StudentEligibilitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(query: QueryStudentEligibilityDto = {}) {
    const where: Prisma.StudentEligibilityWhereInput = {
      ...(query.projectPeriodId ? { projectPeriodId: query.projectPeriodId } : {}),
      ...(query.eligibilityStatus ? { eligibilityStatus: query.eligibilityStatus } : {}),
    };

    return this.prisma.studentEligibility.findMany({
      where,
      include: {
        student: { include: { user: { select: { id: true, email: true, fullName: true } }, faculty: true } },
        projectPeriod: true,
        checkedBy: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.studentEligibility.findUnique({
      where: { id },
      include: {
        student: { include: { user: { select: { id: true, email: true, fullName: true } }, faculty: true } },
        projectPeriod: true,
        checkedBy: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!item) {
      throw new AppException('STUDENT_ELIGIBILITY_NOT_FOUND', 'Không tìm thấy hồ sơ đủ điều kiện', HttpStatus.NOT_FOUND);
    }

    return item;
  }

  async findMe(actor: AuthUser) {
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student) {
      throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên của tài khoản hiện tại', HttpStatus.NOT_FOUND);
    }

    return this.prisma.studentEligibility.findMany({
      where: { studentId: student.id },
      include: { projectPeriod: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateStudentEligibilityDto, actor: AuthUser) {
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) {
      throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy sinh viên', HttpStatus.NOT_FOUND);
    }

    const period = await this.prisma.projectPeriod.findUnique({ where: { id: dto.projectPeriodId } });
    if (!period) {
      throw new AppException('PROJECT_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đồ án', HttpStatus.NOT_FOUND);
    }

    const existed = await this.prisma.studentEligibility.findUnique({
      where: { studentId_projectPeriodId: { studentId: dto.studentId, projectPeriodId: dto.projectPeriodId } },
    });
    if (existed) {
      throw new AppException('STUDENT_ELIGIBILITY_EXISTS', 'Sinh viên đã có trạng thái đủ điều kiện trong đợt này', HttpStatus.CONFLICT);
    }

    const input = this.buildEvaluationInput({
      internshipStatus: dto.internshipStatus,
      academicStatus: dto.academicStatus ?? AcademicStatus.ACTIVE,
      completedCredits: dto.completedCredits ?? student.completedCredits,
      requiredCredits: dto.requiredCredits ?? student.requiredCredits,
      gpa: dto.gpa ?? student.gpa,
      hasPrerequisiteDebt: dto.hasPrerequisiteDebt ?? student.hasPrerequisiteDebt,
      hasTuitionDebt: dto.hasTuitionDebt ?? student.hasTuitionDebt,
      hasDisciplinaryAction: dto.hasDisciplinaryAction ?? student.hasDisciplinaryAction,
    });
    const eligibilityStatus = this.resolveEligibilityStatus(input, dto.eligibilityStatus);
    const evaluation = evaluateStudentEligibility(input);
    const reason = buildEligibilityReason(dto.reason, evaluation);

    const item = await this.prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: dto.studentId },
        data: {
          internshipStatus: input.internshipStatus,
          completedCredits: input.completedCredits,
          requiredCredits: input.requiredCredits,
          gpa: input.gpa,
          hasPrerequisiteDebt: Boolean(input.hasPrerequisiteDebt),
          hasTuitionDebt: Boolean(input.hasTuitionDebt),
          hasDisciplinaryAction: Boolean(input.hasDisciplinaryAction),
        },
      });

      return tx.studentEligibility.create({
        data: {
          studentId: dto.studentId,
          projectPeriodId: dto.projectPeriodId,
          internshipStatus: input.internshipStatus,
          academicStatus: input.academicStatus ?? AcademicStatus.ACTIVE,
          completedCredits: input.completedCredits,
          requiredCredits: input.requiredCredits,
          gpa: input.gpa,
          hasPrerequisiteDebt: Boolean(input.hasPrerequisiteDebt),
          hasTuitionDebt: Boolean(input.hasTuitionDebt),
          hasDisciplinaryAction: Boolean(input.hasDisciplinaryAction),
          eligibilityStatus,
          reason,
          checkedById: actor.id,
          checkedAt: new Date(),
        },
        include: {
          student: { include: { user: { select: { id: true, email: true, fullName: true } }, faculty: true } },
          projectPeriod: true,
          checkedBy: { select: { id: true, email: true, fullName: true } },
        },
      });
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'STUDENT_ELIGIBILITY_CREATED',
      targetType: 'StudentEligibility',
      targetId: item.id,
      result: AuditResult.SUCCESS,
    });

    return item;
  }

  async update(id: string, dto: UpdateStudentEligibilityDto, actor: AuthUser) {
    const current = await this.findOne(id);
    const input = this.buildEvaluationInput({
      internshipStatus: dto.internshipStatus ?? current.internshipStatus,
      academicStatus: dto.academicStatus ?? current.academicStatus,
      completedCredits: dto.completedCredits ?? current.completedCredits,
      requiredCredits: dto.requiredCredits ?? current.requiredCredits,
      gpa: dto.gpa ?? current.gpa,
      hasPrerequisiteDebt: dto.hasPrerequisiteDebt ?? current.hasPrerequisiteDebt,
      hasTuitionDebt: dto.hasTuitionDebt ?? current.hasTuitionDebt,
      hasDisciplinaryAction: dto.hasDisciplinaryAction ?? current.hasDisciplinaryAction,
    });
    const eligibilityStatus = this.resolveEligibilityStatus(input, dto.eligibilityStatus ?? current.eligibilityStatus);
    const evaluation = evaluateStudentEligibility(input);
    const reason = buildEligibilityReason(dto.reason ?? current.reason ?? undefined, evaluation);

    const item = await this.prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: current.studentId },
        data: {
          internshipStatus: input.internshipStatus,
          completedCredits: input.completedCredits,
          requiredCredits: input.requiredCredits,
          gpa: input.gpa,
          hasPrerequisiteDebt: Boolean(input.hasPrerequisiteDebt),
          hasTuitionDebt: Boolean(input.hasTuitionDebt),
          hasDisciplinaryAction: Boolean(input.hasDisciplinaryAction),
        },
      });

      return tx.studentEligibility.update({
        where: { id },
        data: {
          internshipStatus: input.internshipStatus,
          academicStatus: input.academicStatus ?? AcademicStatus.ACTIVE,
          completedCredits: input.completedCredits,
          requiredCredits: input.requiredCredits,
          gpa: input.gpa,
          hasPrerequisiteDebt: Boolean(input.hasPrerequisiteDebt),
          hasTuitionDebt: Boolean(input.hasTuitionDebt),
          hasDisciplinaryAction: Boolean(input.hasDisciplinaryAction),
          eligibilityStatus,
          reason,
          checkedById: actor.id,
          checkedAt: new Date(),
        },
        include: {
          student: { include: { user: { select: { id: true, email: true, fullName: true } }, faculty: true } },
          projectPeriod: true,
          checkedBy: { select: { id: true, email: true, fullName: true } },
        },
      });
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'STUDENT_ELIGIBILITY_UPDATED',
      targetType: 'StudentEligibility',
      targetId: item.id,
      result: AuditResult.SUCCESS,
    });

    return item;
  }

  private buildEvaluationInput(input: StudentEligibilityEvaluationInput): StudentEligibilityEvaluationInput {
    return {
      ...input,
      academicStatus: input.academicStatus ?? AcademicStatus.ACTIVE,
      hasPrerequisiteDebt: Boolean(input.hasPrerequisiteDebt),
      hasTuitionDebt: Boolean(input.hasTuitionDebt),
      hasDisciplinaryAction: Boolean(input.hasDisciplinaryAction),
    };
  }

  private resolveEligibilityStatus(input: StudentEligibilityEvaluationInput, requestedStatus?: EligibilityStatus) {
    const evaluation = evaluateStudentEligibility(input);
    if (requestedStatus === EligibilityStatus.ELIGIBLE && !evaluation.eligible) {
      throw new AppException(
        'STUDENT_ELIGIBILITY_CONDITION_FAILED',
        `Không thể đánh dấu đủ điều kiện: ${evaluation.reasons.join('; ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return resolveEligibilityStatusFromEvaluation(evaluation, requestedStatus);
  }
}
