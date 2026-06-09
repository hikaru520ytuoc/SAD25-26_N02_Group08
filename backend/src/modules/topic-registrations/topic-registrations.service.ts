import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AuditResult,
  EligibilityStatus,
  Prisma,
  ProjectPeriodStatus,
  SupervisorAssignmentStatus,
  SupervisorAssignmentType,
  SupervisorResponseStatus,
  TopicRegistrationStatus,
  TopicRegistrationType,
  TopicSource,
  TopicStatus,
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FacultyAssignSupervisorDto } from './dto/faculty-assign-supervisor.dto';
import { FacultyConfirmRegistrationDto } from './dto/faculty-confirm-registration.dto';
import { FacultyRejectRegistrationDto } from './dto/faculty-reject-registration.dto';
import { ProposeNewTopicDto } from './dto/propose-new-topic.dto';
import { QueryTopicRegistrationDto } from './dto/query-topic-registration.dto';
import { RegisterExistingTopicDto } from './dto/register-existing-topic.dto';
import { SupervisorResponseDto } from './dto/supervisor-response.dto';

@Injectable()
export class TopicRegistrationsService {
  private readonly activeStatuses: TopicRegistrationStatus[] = [
    TopicRegistrationStatus.DRAFT,
    TopicRegistrationStatus.PENDING_SUPERVISOR,
    TopicRegistrationStatus.PENDING_FACULTY,
    TopicRegistrationStatus.NEEDS_REVISION,
    TopicRegistrationStatus.FACULTY_APPROVED,
    TopicRegistrationStatus.OFFICIALLY_ASSIGNED,
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryTopicRegistrationDto = {}) {
    return this.prisma.topicRegistration.findMany({
      where: this.buildWhere(query),
      include: this.registrationInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFacultyPending(query: QueryTopicRegistrationDto = {}) {
    return this.prisma.topicRegistration.findMany({
      where: {
        ...this.buildWhere(query),
        status: {
          in: [
            TopicRegistrationStatus.PENDING_FACULTY,
            TopicRegistrationStatus.NEEDS_REVISION,
          ],
        },
      },
      include: this.registrationInclude(),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findMe(actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    return this.prisma.topicRegistration.findMany({
      where: { studentId: student.id },
      include: this.registrationInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const registration = await this.prisma.topicRegistration.findUnique({
      where: { id },
      include: this.registrationInclude(),
    });

    if (!registration) {
      throw new AppException('TOPIC_REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký đề tài', HttpStatus.NOT_FOUND);
    }

    return registration;
  }

  async registerExisting(dto: RegisterExistingTopicDto, actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    await this.ensureStudentEligible(student.id, dto.projectPeriodId);
    await this.ensureNoActiveRegistration(student.id, dto.projectPeriodId);

    const topic = await this.prisma.topic.findUnique({
      where: { id: dto.topicId },
      include: { supervisor: { include: { user: true } }, projectPeriod: true },
    });

    if (!topic || topic.projectPeriodId !== dto.projectPeriodId) {
      throw new AppException('TOPIC_NOT_FOUND', 'Không tìm thấy đề tài trong đợt đã chọn', HttpStatus.NOT_FOUND);
    }

    if (topic.status !== TopicStatus.PUBLISHED) {
      throw new AppException('TOPIC_NOT_PUBLISHED', 'Chỉ được đăng ký đề tài đã công bố', HttpStatus.CONFLICT);
    }

    this.ensurePeriodAllowsRegistration(topic.projectPeriod.status);
    await this.ensureTopicHasSlot(topic.id, topic.maxStudents);

    const registration = await this.prisma.topicRegistration.create({
      data: {
        studentId: student.id,
        projectPeriodId: dto.projectPeriodId,
        registrationType: TopicRegistrationType.EXISTING_TOPIC,
        topicId: topic.id,
        requestedSupervisorId: topic.supervisorId,
        supervisorResponseStatus: SupervisorResponseStatus.NOT_REQUIRED,
        status: TopicRegistrationStatus.PENDING_FACULTY,
      },
      include: this.registrationInclude(),
    });

    await this.audit(actor, 'TOPIC_REGISTRATION_CREATED', registration.id);
    await this.notifyFacultyManagers('Đăng ký đề tài mới', `${actor.fullName} đã đăng ký đề tài có sẵn.`);

    return registration;
  }

  async proposeNew(dto: ProposeNewTopicDto, actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    await this.ensureStudentEligible(student.id, dto.projectPeriodId);
    await this.ensureNoActiveRegistration(student.id, dto.projectPeriodId);
    const period = await this.ensureProjectPeriod(dto.projectPeriodId);
    this.ensurePeriodAllowsRegistration(period.status);

    let supervisorResponseStatus = SupervisorResponseStatus.NOT_REQUIRED;
    let status = TopicRegistrationStatus.PENDING_FACULTY;

    if (dto.requestedSupervisorId) {
      await this.ensureLecturerExists(dto.requestedSupervisorId);
      supervisorResponseStatus = SupervisorResponseStatus.PENDING;
      status = TopicRegistrationStatus.PENDING_SUPERVISOR;
    }

    const registration = await this.prisma.topicRegistration.create({
      data: {
        studentId: student.id,
        projectPeriodId: dto.projectPeriodId,
        registrationType: TopicRegistrationType.STUDENT_PROPOSED,
        proposedTitle: dto.proposedTitle.trim(),
        proposedDescription: dto.proposedDescription.trim(),
        proposedObjectives: dto.proposedObjectives,
        proposedExpectedOutput: dto.proposedExpectedOutput,
        proposedMajor: dto.proposedMajor,
        requestedSupervisorId: dto.requestedSupervisorId,
        supervisorResponseStatus,
        status,
      },
      include: this.registrationInclude(),
    });

    await this.audit(actor, 'TOPIC_PROPOSAL_CREATED', registration.id);

    if (dto.requestedSupervisorId) {
      const lecturer = await this.prisma.lecturer.findUnique({ where: { id: dto.requestedSupervisorId } });
      if (lecturer) {
        await this.notificationsService.create({
          userId: lecturer.userId,
          title: 'Yêu cầu hướng dẫn mới',
          message: `${actor.fullName} đã đề xuất bạn hướng dẫn đề tài mới.`,
          type: 'SUPERVISOR_REQUEST',
        });
      }
    } else {
      await this.notifyFacultyManagers('Đề xuất đề tài mới', `${actor.fullName} đã đề xuất đề tài mới và chờ Khoa phân công GVHD.`);
    }

    return registration;
  }

  async cancel(id: string, actor: AuthUser) {
    const registration = await this.findOne(id);
    const student = await this.getStudentByUserId(actor.id);

    if (registration.studentId !== student.id) {
      throw new AppException('TOPIC_REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký đề tài của bạn', HttpStatus.NOT_FOUND);
    }

    if (registration.status === TopicRegistrationStatus.OFFICIALLY_ASSIGNED) {
      throw new AppException('TOPIC_REGISTRATION_INVALID_STATUS', 'Không thể hủy đăng ký đã được xác nhận chính thức', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.topicRegistration.update({
      where: { id },
      data: { status: TopicRegistrationStatus.CANCELLED },
      include: this.registrationInclude(),
    });

    await this.audit(actor, 'TOPIC_REGISTRATION_CANCELLED', id);
    return updated;
  }

  async findSupervisorPending(actor: AuthUser) {
    const lecturer = await this.getLecturerByUserId(actor.id);
    return this.prisma.topicRegistration.findMany({
      where: {
        requestedSupervisorId: lecturer.id,
        supervisorResponseStatus: SupervisorResponseStatus.PENDING,
        status: TopicRegistrationStatus.PENDING_SUPERVISOR,
      },
      include: this.registrationInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async supervisorAccept(id: string, dto: SupervisorResponseDto, actor: AuthUser) {
    const { registration } = await this.ensureSupervisorRequestForCurrentUser(id, actor);

    const updated = await this.prisma.topicRegistration.update({
      where: { id },
      data: {
        supervisorResponseStatus: SupervisorResponseStatus.ACCEPTED,
        supervisorResponseNote: dto.supervisorResponseNote,
        status: TopicRegistrationStatus.PENDING_FACULTY,
      },
      include: this.registrationInclude(),
    });

    await this.audit(actor, 'SUPERVISOR_REQUEST_ACCEPTED', id);
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'GVHD đã đồng ý hướng dẫn',
      message: `${actor.fullName} đã đồng ý hướng dẫn đề tài của bạn.`,
      type: 'SUPERVISOR_ACCEPTED',
    });
    await this.notifyFacultyManagers('GVHD đã đồng ý', `${actor.fullName} đã đồng ý hướng dẫn một đề xuất đề tài.`);

    return updated;
  }

  async supervisorReject(id: string, dto: SupervisorResponseDto, actor: AuthUser) {
    if (!dto.supervisorResponseNote?.trim()) {
      throw new AppException('SUPERVISOR_RESPONSE_NOTE_REQUIRED', 'Cần nhập lý do từ chối hướng dẫn', HttpStatus.BAD_REQUEST);
    }

    const { registration } = await this.ensureSupervisorRequestForCurrentUser(id, actor);

    const updated = await this.prisma.topicRegistration.update({
      where: { id },
      data: {
        supervisorResponseStatus: SupervisorResponseStatus.REJECTED,
        supervisorResponseNote: dto.supervisorResponseNote.trim(),
        status: TopicRegistrationStatus.PENDING_FACULTY,
      },
      include: this.registrationInclude(),
    });

    await this.audit(actor, 'SUPERVISOR_REQUEST_REJECTED', id, dto.supervisorResponseNote);
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'GVHD đã từ chối hướng dẫn',
      message: `${actor.fullName} đã từ chối hướng dẫn. Khoa sẽ tiếp tục xử lý đăng ký của bạn.`,
      type: 'SUPERVISOR_REJECTED',
    });
    await this.notifyFacultyManagers('GVHD đã từ chối', `${actor.fullName} đã từ chối một yêu cầu hướng dẫn.`);

    return updated;
  }

  async facultyAssignSupervisor(id: string, dto: FacultyAssignSupervisorDto, actor: AuthUser) {
    const registration = await this.findOne(id);
    const supervisor = await this.ensureLecturerExists(dto.supervisorId);

    if (registration.status === TopicRegistrationStatus.CANCELLED || registration.status === TopicRegistrationStatus.FACULTY_REJECTED || registration.status === TopicRegistrationStatus.OFFICIALLY_ASSIGNED) {
      throw new AppException('TOPIC_REGISTRATION_INVALID_STATUS', 'Không thể phân công GVHD cho đăng ký ở trạng thái hiện tại', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.topicRegistration.update({
      where: { id },
      data: {
        requestedSupervisorId: supervisor.id,
        supervisorResponseStatus: SupervisorResponseStatus.NOT_REQUIRED,
        supervisorResponseNote: null,
        status: TopicRegistrationStatus.PENDING_FACULTY,
      },
      include: this.registrationInclude(),
    });

    await this.audit(actor, 'FACULTY_SUPERVISOR_ASSIGNED', id);
    await this.notificationsService.create({
      userId: supervisor.userId,
      title: 'Khoa phân công hướng dẫn',
      message: 'Khoa đã phân công bạn làm GVHD cho một đăng ký đề tài.',
      type: 'FACULTY_ASSIGNED_SUPERVISOR',
    });

    return updated;
  }

  async facultyConfirm(id: string, dto: FacultyConfirmRegistrationDto, actor: AuthUser) {
    const registration = await this.findOne(id);

    if (registration.status !== TopicRegistrationStatus.PENDING_FACULTY && registration.status !== TopicRegistrationStatus.FACULTY_APPROVED) {
      throw new AppException('TOPIC_REGISTRATION_INVALID_STATUS', 'Chỉ xác nhận đăng ký đang chờ Khoa xử lý', HttpStatus.CONFLICT);
    }

    const supervisorId = this.resolveSupervisorId(registration);
    const supervisor = await this.ensureLecturerExists(supervisorId);

    await this.ensureNoActiveAssignment(registration.studentId, registration.projectPeriodId);

    let officialTopicId = registration.topicId;
    let assignmentType = SupervisorAssignmentType.TOPIC_OWNER;

    if (registration.registrationType === TopicRegistrationType.STUDENT_PROPOSED) {
      officialTopicId = await this.createOfficialTopicFromProposal(registration, supervisor.id, actor);
      assignmentType = registration.supervisorResponseStatus === SupervisorResponseStatus.ACCEPTED
        ? SupervisorAssignmentType.STUDENT_REQUESTED
        : SupervisorAssignmentType.FACULTY_ASSIGNED;
    }

    if (registration.registrationType === TopicRegistrationType.EXISTING_TOPIC && registration.topic?.supervisorId !== supervisor.id) {
      assignmentType = SupervisorAssignmentType.FACULTY_ASSIGNED;
    }

    const [updated, assignment] = await this.prisma.$transaction([
      this.prisma.topicRegistration.update({
        where: { id },
        data: {
          topicId: officialTopicId,
          requestedSupervisorId: supervisor.id,
          status: TopicRegistrationStatus.OFFICIALLY_ASSIGNED,
          facultyNote: dto.facultyNote,
          confirmedById: actor.id,
          confirmedAt: new Date(),
        },
        include: this.registrationInclude(),
      }),
      this.prisma.supervisorAssignment.create({
        data: {
          topicRegistrationId: id,
          studentId: registration.studentId,
          topicId: officialTopicId,
          projectPeriodId: registration.projectPeriodId,
          supervisorId: supervisor.id,
          assignedById: actor.id,
          assignmentType,
          status: SupervisorAssignmentStatus.ACTIVE,
        },
      }),
    ]);

    await this.audit(actor, 'TOPIC_REGISTRATION_CONFIRMED', id);
    await this.audit(actor, 'SUPERVISOR_ASSIGNMENT_CREATED', assignment.id);
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'Đăng ký đề tài đã được xác nhận',
      message: 'Khoa đã xác nhận đề tài và GVHD chính thức cho bạn.',
      type: 'REGISTRATION_CONFIRMED',
    });
    await this.notificationsService.create({
      userId: supervisor.userId,
      title: 'Phân công GVHD chính thức',
      message: `Bạn đã được phân công hướng dẫn sinh viên ${registration.student.user.fullName}.`,
      type: 'SUPERVISOR_ASSIGNMENT_CREATED',
    });

    return updated;
  }

  async facultyReject(id: string, dto: FacultyRejectRegistrationDto, actor: AuthUser) {
    const registration = await this.findOne(id);

    if (!dto.rejectedReason.trim()) {
      throw new AppException('FACULTY_REJECTION_REASON_REQUIRED', 'Cần nhập lý do từ chối', HttpStatus.BAD_REQUEST);
    }

    if (registration.status === TopicRegistrationStatus.OFFICIALLY_ASSIGNED) {
      throw new AppException('TOPIC_REGISTRATION_INVALID_STATUS', 'Không thể từ chối đăng ký đã xác nhận chính thức', HttpStatus.CONFLICT);
    }

    const updated = await this.prisma.topicRegistration.update({
      where: { id },
      data: {
        status: TopicRegistrationStatus.FACULTY_REJECTED,
        rejectedReason: dto.rejectedReason.trim(),
      },
      include: this.registrationInclude(),
    });

    await this.audit(actor, 'TOPIC_REGISTRATION_REJECTED', id, dto.rejectedReason);
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'Đăng ký đề tài bị từ chối',
      message: `Khoa đã từ chối đăng ký đề tài của bạn. Lý do: ${dto.rejectedReason}`,
      type: 'REGISTRATION_REJECTED',
    });

    return updated;
  }

  async listSupervisors() {
    return this.prisma.lecturer.findMany({
      include: { user: { select: { id: true, email: true, fullName: true } }, faculty: true },
      orderBy: { lecturerCode: 'asc' },
    });
  }

  private buildWhere(query: QueryTopicRegistrationDto): Prisma.TopicRegistrationWhereInput {
    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.registrationType ? { registrationType: query.registrationType } : {}),
      ...(query.projectPeriodId ? { projectPeriodId: query.projectPeriodId } : {}),
    };
  }

  private registrationInclude(): Prisma.TopicRegistrationInclude {
    return {
      student: { include: { user: { select: { id: true, email: true, fullName: true } } } },
      projectPeriod: true,
      topic: { include: { supervisor: { include: { user: { select: { id: true, email: true, fullName: true } } } } } },
      requestedSupervisor: { include: { user: { select: { id: true, email: true, fullName: true } } } },
      confirmedBy: { select: { id: true, email: true, fullName: true } },
      supervisorAssignment: true,
    };
  }

  private async getStudentByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppException('STUDENT_NOT_FOUND', 'Tài khoản hiện tại chưa có hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    }
    return student;
  }

  private async getLecturerByUserId(userId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { userId } });
    if (!lecturer) {
      throw new AppException('SUPERVISOR_NOT_FOUND', 'Tài khoản hiện tại chưa có hồ sơ giảng viên', HttpStatus.NOT_FOUND);
    }
    return lecturer;
  }

  private async ensureLecturerExists(id?: string | null) {
    if (!id) {
      throw new AppException('SUPERVISOR_NOT_FOUND', 'Chưa có GVHD để xác nhận', HttpStatus.NOT_FOUND);
    }

    const lecturer = await this.prisma.lecturer.findUnique({ where: { id } });
    if (!lecturer) {
      throw new AppException('SUPERVISOR_NOT_FOUND', 'Không tìm thấy GVHD', HttpStatus.NOT_FOUND);
    }
    return lecturer;
  }

  private async ensureProjectPeriod(projectPeriodId: string) {
    const period = await this.prisma.projectPeriod.findUnique({ where: { id: projectPeriodId } });
    if (!period) {
      throw new AppException('PROJECT_PERIOD_NOT_FOUND', 'Không tìm thấy đợt đồ án', HttpStatus.NOT_FOUND);
    }
    return period;
  }

  private ensurePeriodAllowsRegistration(status: ProjectPeriodStatus) {
    if (status === ProjectPeriodStatus.CLOSED || status === ProjectPeriodStatus.ARCHIVED) {
      throw new AppException('TOPIC_REGISTRATION_INVALID_STATUS', 'Đợt đồ án đã đóng hoặc lưu trữ', HttpStatus.CONFLICT);
    }
  }

  private async ensureStudentEligible(studentId: string, projectPeriodId: string) {
    const eligibility = await this.prisma.studentEligibility.findUnique({
      where: { studentId_projectPeriodId: { studentId, projectPeriodId } },
    });

    if (!eligibility || eligibility.eligibilityStatus !== EligibilityStatus.ELIGIBLE) {
      throw new AppException('STUDENT_NOT_ELIGIBLE', 'Sinh viên chưa đủ điều kiện đăng ký đề tài', HttpStatus.FORBIDDEN);
    }
  }

  private async ensureNoActiveRegistration(studentId: string, projectPeriodId: string) {
    const existing = await this.prisma.topicRegistration.findFirst({
      where: {
        studentId,
        projectPeriodId,
        status: { in: this.activeStatuses },
      },
    });

    if (existing) {
      throw new AppException('TOPIC_REGISTRATION_EXISTS', 'Sinh viên đã có đăng ký đề tài trong đợt này', HttpStatus.CONFLICT);
    }
  }

  private async ensureNoActiveAssignment(studentId: string, projectPeriodId: string) {
    const existing = await this.prisma.supervisorAssignment.findFirst({
      where: { studentId, projectPeriodId, status: SupervisorAssignmentStatus.ACTIVE },
    });

    if (existing) {
      throw new AppException('SUPERVISOR_ASSIGNMENT_EXISTS', 'Sinh viên đã có GVHD chính thức trong đợt này', HttpStatus.CONFLICT);
    }
  }

  private async ensureTopicHasSlot(topicId: string, maxStudents: number) {
    const count = await this.prisma.topicRegistration.count({
      where: {
        topicId,
        status: TopicRegistrationStatus.OFFICIALLY_ASSIGNED,
      },
    });

    if (count >= maxStudents) {
      throw new AppException('TOPIC_REGISTRATION_INVALID_STATUS', 'Đề tài đã đủ số lượng sinh viên', HttpStatus.CONFLICT);
    }
  }

  private async ensureSupervisorRequestForCurrentUser(id: string, actor: AuthUser) {
    const lecturer = await this.getLecturerByUserId(actor.id);
    const registration = await this.prisma.topicRegistration.findUnique({
      where: { id },
      include: this.registrationInclude(),
    });

    if (!registration) {
      throw new AppException('TOPIC_REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký đề tài', HttpStatus.NOT_FOUND);
    }

    if (registration.requestedSupervisorId !== lecturer.id) {
      throw new AppException('SUPERVISOR_REQUEST_NOT_FOR_CURRENT_USER', 'Yêu cầu hướng dẫn này không gửi tới bạn', HttpStatus.FORBIDDEN);
    }

    if (registration.supervisorResponseStatus !== SupervisorResponseStatus.PENDING || registration.status !== TopicRegistrationStatus.PENDING_SUPERVISOR) {
      throw new AppException('TOPIC_REGISTRATION_INVALID_STATUS', 'Yêu cầu hướng dẫn không còn chờ phản hồi', HttpStatus.CONFLICT);
    }

    return { lecturer, registration };
  }

  private resolveSupervisorId(registration: Awaited<ReturnType<TopicRegistrationsService['findOne']>>) {
    if (registration.registrationType === TopicRegistrationType.EXISTING_TOPIC) {
      return registration.requestedSupervisorId ?? registration.topic?.supervisorId;
    }

    if (registration.requestedSupervisorId && registration.supervisorResponseStatus !== SupervisorResponseStatus.REJECTED) {
      return registration.requestedSupervisorId;
    }

    throw new AppException('SUPERVISOR_NOT_FOUND', 'Khoa cần phân công GVHD trước khi xác nhận', HttpStatus.BAD_REQUEST);
  }

  private async createOfficialTopicFromProposal(
    registration: Awaited<ReturnType<TopicRegistrationsService['findOne']>>,
    supervisorId: string,
    actor: AuthUser,
  ) {
    const topic = await this.prisma.topic.create({
      data: {
        title: registration.proposedTitle ?? 'Đề tài sinh viên đề xuất',
        description: registration.proposedDescription ?? '',
        objectives: registration.proposedObjectives,
        expectedOutput: registration.proposedExpectedOutput,
        major: registration.proposedMajor,
        maxStudents: 1,
        supervisorId,
        projectPeriodId: registration.projectPeriodId,
        status: TopicStatus.PUBLISHED,
        source: TopicSource.STUDENT_PROPOSED,
        proposedByStudentId: registration.studentId,
        approvedById: actor.id,
        approvedAt: new Date(),
        publishedAt: new Date(),
      },
    });

    return topic.id;
  }

  private async notifyFacultyManagers(title: string, message: string) {
    const managers = await this.prisma.user.findMany({
      where: { userRoles: { some: { role: { code: 'FACULTY_MANAGER' } } } },
      select: { id: true },
    });

    await Promise.all(
      managers.map((manager) => this.notificationsService.create({ userId: manager.id, title, message, type: 'FACULTY_TASK' })),
    );
  }

  private async audit(actor: AuthUser, action: string, targetId: string, reason?: string | null) {
    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetType: 'TopicRegistration',
      targetId,
      result: AuditResult.SUCCESS,
      reason,
    });
  }
}
