import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditResult, ProjectPeriodRegistrationStatus, ProjectPeriodStatus, TopicRegistrationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { evaluateStudentAcademicEligibility } from '../../common/utils/student-academic-eligibility.util';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RegisterProjectPeriodDto } from './dto/register-project-period.dto';

@Injectable()
export class ProjectPeriodRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async available(actor: AuthUser) {
    const student = await this.getStudent(actor.id);
    const eligibility = this.evaluate(student);
    const activeRegistration = await this.prisma.projectPeriodRegistration.findFirst({
      where: { studentId: student.id, status: ProjectPeriodRegistrationStatus.REGISTERED },
      include: { projectPeriod: true },
    });

    if (!eligibility.eligible) return { eligibility, activeRegistration, periods: [] };

    const now = new Date();
    const periods = await this.prisma.projectPeriod.findMany({
      where: {
        status: ProjectPeriodStatus.OPEN,
        AND: [
          { OR: [{ registrationStartDate: null }, { registrationStartDate: { lte: now } }] },
          { OR: [{ registrationEndDate: null }, { registrationEndDate: { gte: now } }] },
        ],
      },
      orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }],
    });

    return { eligibility, activeRegistration, periods };
  }

  async findMe(actor: AuthUser) {
    const student = await this.getStudent(actor.id);
    return this.prisma.projectPeriodRegistration.findMany({
      where: { studentId: student.id },
      include: { projectPeriod: true },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async register(dto: RegisterProjectPeriodDto, actor: AuthUser) {
    const student = await this.getStudent(actor.id);
    const eligibility = this.evaluate(student);
    if (!eligibility.eligible) {
      throw new AppException('STUDENT_NOT_ELIGIBLE', `Bạn chưa đủ điều kiện đăng ký đợt đồ án: ${eligibility.reasons.join('; ')}`, HttpStatus.FORBIDDEN);
    }

    const period = await this.prisma.projectPeriod.findUnique({ where: { id: dto.projectPeriodId } });
    if (!period) throw new AppException('PROJECT_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đồ án', HttpStatus.NOT_FOUND);
    this.ensurePeriodOpen(period);

    const active = await this.prisma.projectPeriodRegistration.findFirst({
      where: { studentId: student.id, status: ProjectPeriodRegistrationStatus.REGISTERED },
    });
    if (active && active.projectPeriodId !== period.id) {
      throw new AppException('ACTIVE_PROJECT_PERIOD_EXISTS', 'Bạn đã đăng ký một đợt đồ án đang hoạt động', HttpStatus.CONFLICT);
    }

    const registration = await this.prisma.projectPeriodRegistration.upsert({
      where: { studentId_projectPeriodId: { studentId: student.id, projectPeriodId: period.id } },
      update: { status: ProjectPeriodRegistrationStatus.REGISTERED, registeredAt: new Date(), cancelledAt: null },
      create: { studentId: student.id, projectPeriodId: period.id, status: ProjectPeriodRegistrationStatus.REGISTERED },
      include: { projectPeriod: true },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROJECT_PERIOD_REGISTERED_BY_STUDENT',
      targetType: 'ProjectPeriodRegistration',
      targetId: registration.id,
      result: AuditResult.SUCCESS,
    });
    return registration;
  }

  async cancel(id: string, actor: AuthUser) {
    const student = await this.getStudent(actor.id);
    const registration = await this.prisma.projectPeriodRegistration.findFirst({ where: { id, studentId: student.id } });
    if (!registration) throw new AppException('PROJECT_PERIOD_REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký đợt đồ án', HttpStatus.NOT_FOUND);
    if (registration.status !== ProjectPeriodRegistrationStatus.REGISTERED) return registration;

    const activeTopic = await this.prisma.topicRegistration.findFirst({
      where: {
        studentId: student.id,
        projectPeriodId: registration.projectPeriodId,
        status: { notIn: [TopicRegistrationStatus.CANCELLED, TopicRegistrationStatus.FACULTY_REJECTED] },
      },
    });
    if (activeTopic) {
      throw new AppException('PROJECT_PERIOD_HAS_TOPIC_REGISTRATION', 'Không thể hủy đợt sau khi đã đăng ký đề tài', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.projectPeriodRegistration.update({
      where: { id },
      data: { status: ProjectPeriodRegistrationStatus.CANCELLED, cancelledAt: new Date() },
      include: { projectPeriod: true },
    });
    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'PROJECT_PERIOD_REGISTRATION_CANCELLED',
      targetType: 'ProjectPeriodRegistration',
      targetId: id,
      result: AuditResult.SUCCESS,
    });
    return updated;
  }

  private async getStudent(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { user: true, major: true },
    });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Tài khoản hiện tại chưa có hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    return student;
  }

  private evaluate(student: any) {
    return evaluateStudentAcademicEligibility({
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
  }

  private ensurePeriodOpen(period: { status: ProjectPeriodStatus; registrationStartDate: Date | null; registrationEndDate: Date | null }) {
    if (period.status !== ProjectPeriodStatus.OPEN) {
      throw new AppException('PROJECT_PERIOD_NOT_OPEN', 'Đợt đồ án chưa mở đăng ký', HttpStatus.CONFLICT);
    }
    const now = new Date();
    if (period.registrationStartDate && period.registrationStartDate > now) {
      throw new AppException('PROJECT_PERIOD_REGISTRATION_NOT_STARTED', 'Chưa đến thời gian đăng ký đợt đồ án', HttpStatus.CONFLICT);
    }
    if (period.registrationEndDate && period.registrationEndDate < now) {
      throw new AppException('PROJECT_PERIOD_REGISTRATION_ENDED', 'Đã hết thời gian đăng ký đợt đồ án', HttpStatus.CONFLICT);
    }
  }
}
