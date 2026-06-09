import { HttpStatus, Injectable } from '@nestjs/common';
import { DefenseRegistrationStatus, ReviewerAssignmentStatus, ReviewerEligibilityStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewerAssignmentDto } from './dto/create-reviewer-assignment.dto';
import { CreateReviewerEvaluationDto } from './dto/create-reviewer-evaluation.dto';
import { QueryReviewerAssignmentDto } from './dto/query-reviewer-assignment.dto';
import { UpdateReviewerAssignmentDto } from './dto/update-reviewer-assignment.dto';
import { UpdateReviewerEvaluationDto } from './dto/update-reviewer-evaluation.dto';

@Injectable()
export class ReviewersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAssignments(query: QueryReviewerAssignmentDto = {}) {
    return this.prisma.reviewerAssignment.findMany({
      where: { status: query.status, projectPeriodId: query.projectPeriodId },
      include: this.assignmentInclude(),
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findMyAssignments(actor: AuthUser, query: QueryReviewerAssignmentDto = {}) {
    const reviewer = await this.getLecturerByUserId(actor.id);
    return this.prisma.reviewerAssignment.findMany({
      where: { reviewerId: reviewer.id, status: query.status, projectPeriodId: query.projectPeriodId },
      include: this.assignmentInclude(),
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findAssignment(id: string, actor: AuthUser) {
    const assignment = await this.getAssignmentOrThrow(id);
    await this.ensureCanViewAssignment(assignment, actor);
    return assignment;
  }

  async createAssignment(dto: CreateReviewerAssignmentDto, actor: AuthUser) {
    const registration = await this.prisma.defenseRegistration.findUnique({
      where: { id: dto.defenseRegistrationId },
      include: { student: { include: { user: true } }, supervisor: { include: { user: true } }, projectPeriod: true, reviewerAssignment: true },
    });
    if (!registration) {
      throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy hồ sơ đăng ký bảo vệ', HttpStatus.NOT_FOUND);
    }
    if (registration.status !== DefenseRegistrationStatus.APPROVED_BY_SUPERVISOR && registration.status !== DefenseRegistrationStatus.SENT_TO_REVIEWER) {
      throw new AppException('DEFENSE_REGISTRATION_INVALID_STATUS', 'Chỉ phân công phản biện sau khi GVHD xác nhận đủ điều kiện', HttpStatus.CONFLICT);
    }
    if (registration.reviewerAssignment) {
      throw new AppException('REVIEWER_ASSIGNMENT_EXISTS', 'Hồ sơ này đã có giảng viên phản biện', HttpStatus.CONFLICT);
    }

    const reviewer = await this.prisma.lecturer.findUnique({ where: { id: dto.reviewerId }, include: { user: true } });
    if (!reviewer) {
      throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy giảng viên phản biện', HttpStatus.NOT_FOUND);
    }
    if (reviewer.id === registration.supervisorId) {
      throw new AppException('REVIEWER_CANNOT_BE_SUPERVISOR', 'GVPB không được trùng với GVHD', HttpStatus.BAD_REQUEST);
    }

    const assignment = await this.prisma.reviewerAssignment.create({
      data: {
        defenseRegistrationId: registration.id,
        studentId: registration.studentId,
        projectPeriodId: registration.projectPeriodId,
        supervisorId: registration.supervisorId,
        reviewerId: reviewer.id,
        assignedById: actor.id,
        status: ReviewerAssignmentStatus.ASSIGNED,
      },
      include: this.assignmentInclude(),
    });

    await this.prisma.defenseRegistration.update({ where: { id: registration.id }, data: { status: DefenseRegistrationStatus.SENT_TO_REVIEWER } });
    await this.audit(actor, 'REVIEWER_ASSIGNED', assignment.id);
    await this.notificationsService.create({
      userId: reviewer.userId,
      title: 'Bạn được phân công phản biện',
      message: `Bạn được phân công phản biện hồ sơ của sinh viên ${registration.student.user.fullName}.`,
      type: 'REVIEWER_ASSIGNED',
    });
    await this.notificationsService.create({
      userId: registration.student.userId,
      title: 'Hồ sơ đã được phân công phản biện',
      message: `Khoa đã phân công ${reviewer.user.fullName} phản biện hồ sơ bảo vệ của bạn.`,
      type: 'REVIEWER_ASSIGNED',
    });

    return assignment;
  }

  async updateAssignment(id: string, dto: UpdateReviewerAssignmentDto, actor: AuthUser) {
    const assignment = await this.getAssignmentOrThrow(id);
    let reviewerId = assignment.reviewerId;
    if (dto.reviewerId) {
      const reviewer = await this.prisma.lecturer.findUnique({ where: { id: dto.reviewerId } });
      if (!reviewer) throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy GVPB', HttpStatus.NOT_FOUND);
      if (dto.reviewerId === assignment.supervisorId) {
        throw new AppException('REVIEWER_CANNOT_BE_SUPERVISOR', 'GVPB không được trùng với GVHD', HttpStatus.BAD_REQUEST);
      }
      reviewerId = dto.reviewerId;
    }

    const updated = await this.prisma.reviewerAssignment.update({
      where: { id },
      data: { reviewerId, status: dto.status },
      include: this.assignmentInclude(),
    });
    await this.audit(actor, dto.status === ReviewerAssignmentStatus.CANCELLED ? 'REVIEWER_ASSIGNMENT_CANCELLED' : 'REVIEWER_ASSIGNED', id);
    return updated;
  }

  async createEvaluation(dto: CreateReviewerEvaluationDto, actor: AuthUser) {
    const assignment = await this.getAssignmentOrThrow(dto.reviewerAssignmentId);
    await this.ensureReviewerOwnsAssignment(assignment, actor);
    this.validateEvaluation(dto.comment, dto.eligibilityStatus, dto.feedbackToStudent);

    const evaluation = await this.prisma.reviewerEvaluation.upsert({
      where: { reviewerAssignmentId: assignment.id },
      update: {
        comment: dto.comment.trim(),
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        questionSuggestions: dto.questionSuggestions,
        eligibilityStatus: dto.eligibilityStatus,
        feedbackToStudent: dto.feedbackToStudent,
        submittedAt: new Date(),
      },
      create: {
        reviewerAssignmentId: assignment.id,
        reviewerId: assignment.reviewerId,
        defenseRegistrationId: assignment.defenseRegistrationId,
        comment: dto.comment.trim(),
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        questionSuggestions: dto.questionSuggestions,
        eligibilityStatus: dto.eligibilityStatus,
        feedbackToStudent: dto.feedbackToStudent,
      },
    });

    if (typeof dto.score === 'number') {
      this.validateScore(dto.score);
      await this.prisma.reviewerScore.upsert({
        where: { reviewerAssignmentId: assignment.id },
        update: { score: dto.score, comment: dto.scoreComment },
        create: { reviewerAssignmentId: assignment.id, reviewerId: assignment.reviewerId, score: dto.score, comment: dto.scoreComment },
      });
    }

    const hasSupervisorScore = Boolean(assignment.defenseRegistration.supervisorScore);
    const hasReviewerScore = typeof dto.score === 'number' || Boolean(assignment.reviewerScore);
    const nextStatus = dto.eligibilityStatus === ReviewerEligibilityStatus.NOT_ELIGIBLE_FOR_DEFENSE
      ? DefenseRegistrationStatus.REVIEWER_NEEDS_REVISION
      : hasSupervisorScore && hasReviewerScore
        ? DefenseRegistrationStatus.READY_FOR_COUNCIL
        : DefenseRegistrationStatus.APPROVED_BY_REVIEWER;

    await this.prisma.defenseRegistration.update({ where: { id: assignment.defenseRegistrationId }, data: { status: nextStatus } });
    await this.prisma.reviewerAssignment.update({ where: { id: assignment.id }, data: { status: ReviewerAssignmentStatus.COMPLETED } });

    await this.audit(actor, 'REVIEWER_EVALUATION_CREATED', evaluation.id);
    if (typeof dto.score === 'number') await this.audit(actor, 'REVIEWER_SCORE_CREATED', assignment.id);
    await this.notificationsService.create({
      userId: assignment.student.userId,
      title: 'GVPB đã phản hồi hồ sơ bảo vệ',
      message: dto.eligibilityStatus === ReviewerEligibilityStatus.ELIGIBLE_FOR_DEFENSE ? 'GVPB xác nhận hồ sơ đủ điều kiện từ góc độ phản biện.' : dto.feedbackToStudent ?? 'GVPB yêu cầu chỉnh sửa hồ sơ.',
      type: dto.eligibilityStatus === ReviewerEligibilityStatus.ELIGIBLE_FOR_DEFENSE ? 'REVIEWER_APPROVED_DEFENSE_ELIGIBILITY' : 'REVIEWER_REJECTED_DEFENSE_ELIGIBILITY',
    });

    return this.getAssignmentOrThrow(assignment.id);
  }

  async getEvaluation(assignmentId: string, actor: AuthUser) {
    const assignment = await this.getAssignmentOrThrow(assignmentId);
    await this.ensureCanViewAssignment(assignment, actor);
    return this.prisma.reviewerEvaluation.findUnique({ where: { reviewerAssignmentId: assignment.id } });
  }

  async updateEvaluation(id: string, dto: UpdateReviewerEvaluationDto, actor: AuthUser) {
    const evaluation = await this.prisma.reviewerEvaluation.findUnique({
      where: { id },
      include: { reviewerAssignment: { include: { reviewer: true } } },
    });
    if (!evaluation) throw new AppException('REVIEWER_EVALUATION_NOT_FOUND', 'Không tìm thấy nhận xét phản biện', HttpStatus.NOT_FOUND);
    await this.ensureReviewerOwnsAssignment(evaluation.reviewerAssignment, actor);

    const comment = dto.comment ?? evaluation.comment;
    const eligibilityStatus = dto.eligibilityStatus ?? evaluation.eligibilityStatus;
    const feedbackToStudent = dto.feedbackToStudent ?? evaluation.feedbackToStudent ?? undefined;
    this.validateEvaluation(comment, eligibilityStatus, feedbackToStudent);

    const updated = await this.prisma.reviewerEvaluation.update({
      where: { id },
      data: {
        comment: comment.trim(),
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        questionSuggestions: dto.questionSuggestions,
        eligibilityStatus,
        feedbackToStudent,
        submittedAt: new Date(),
      },
    });
    await this.audit(actor, 'REVIEWER_EVALUATION_UPDATED', id);
    return updated;
  }

  private assignmentInclude() {
    return {
      student: { include: { user: true } },
      projectPeriod: true,
      supervisor: { include: { user: true } },
      reviewer: { include: { user: true } },
      defenseRegistration: {
        include: {
          topicRegistration: { include: { topic: true } },
          outline: true,
          reportFile: true,
          slideFile: true,
          additionalDocumentFile: true,
          supervisorScore: true,
        },
      },
      evaluation: true,
      reviewerScore: true,
    } as const;
  }

  private async getAssignmentOrThrow(id: string) {
    const assignment = await this.prisma.reviewerAssignment.findUnique({ where: { id }, include: this.assignmentInclude() });
    if (!assignment) throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy phân công phản biện', HttpStatus.NOT_FOUND);
    return assignment;
  }

  private validateEvaluation(comment: string | undefined, status: ReviewerEligibilityStatus, feedback?: string) {
    if (!comment?.trim()) throw new AppException('REVIEWER_COMMENT_REQUIRED', 'Nhận xét phản biện là bắt buộc', HttpStatus.BAD_REQUEST);
    if (status === ReviewerEligibilityStatus.NOT_ELIGIBLE_FOR_DEFENSE && !feedback?.trim()) {
      throw new AppException('REVIEWER_FEEDBACK_REQUIRED', 'Feedback là bắt buộc khi GVPB xác nhận chưa đủ điều kiện', HttpStatus.BAD_REQUEST);
    }
  }

  private validateScore(score: number) {
    if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 10) {
      throw new AppException('REVIEWER_SCORE_INVALID', 'Điểm phản biện phải nằm trong khoảng 0 đến 10', HttpStatus.BAD_REQUEST);
    }
  }

  private async ensureReviewerOwnsAssignment(assignment: any, actor: AuthUser) {
    if (assignment.reviewer?.userId !== actor.id) {
      throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy phân công phản biện của bạn', HttpStatus.NOT_FOUND);
    }
  }

  private async ensureCanViewAssignment(assignment: any, actor: AuthUser) {
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return;
    if (assignment.reviewer?.userId === actor.id || assignment.supervisor?.userId === actor.id || assignment.student?.userId === actor.id) return;
    throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy phân công phản biện', HttpStatus.NOT_FOUND);
  }

  private async getLecturerByUserId(userId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { userId }, include: { user: true } });
    if (!lecturer) throw new AppException('SUPERVISOR_NOT_FOUND', 'Không tìm thấy hồ sơ giảng viên', HttpStatus.NOT_FOUND);
    return lecturer;
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType: 'Reviewer', targetId, result: 'SUCCESS' });
  }
}
