import { HttpStatus, Injectable } from '@nestjs/common';
import { CouncilRole, DefenseDocumentStatus, FinalResultStatus, ResultPublicationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RecordLockService } from '../record-lock/record-lock.service';
import { CreateCouncilScoreDto } from './dto/create-council-score.dto';
import { CreateReviewerScoreDto } from './dto/create-reviewer-score.dto';
import { CreateSupervisorScoreDto } from './dto/create-supervisor-score.dto';
import { UpdateCouncilScoreDto } from './dto/update-council-score.dto';
import { UpdateReviewerScoreDto } from './dto/update-reviewer-score.dto';
import { UpdateSupervisorScoreDto } from './dto/update-supervisor-score.dto';

const PASSING_SCORE = 5.5;
const DECIMAL_PLACES = 2;

@Injectable()
export class ScoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly recordLockService: RecordLockService,
  ) {}

  async createSupervisorScore(dto: CreateSupervisorScoreDto, actor: AuthUser) {
    const registration = await this.prisma.defenseRegistration.findUnique({
      where: { id: dto.defenseRegistrationId },
      include: { supervisor: true },
    });
    if (!registration) throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(registration.studentId, registration.projectPeriodId);
    await this.ensureResultNotPublishedByRegistration(registration.id);
    const lecturer = await this.getLecturerByUserId(actor.id);
    if (registration.supervisorId !== lecturer.id) throw new AppException('DEFENSE_REGISTRATION_NOT_ALLOWED', 'GVHD không có quyền nhập điểm hồ sơ này', HttpStatus.FORBIDDEN);
    this.validateScore(dto.score, 'SUPERVISOR_SCORE_INVALID');

    const score = await this.prisma.supervisorScore.upsert({
      where: { defenseRegistrationId: registration.id },
      update: { score: dto.score, comment: dto.comment },
      create: { defenseRegistrationId: registration.id, supervisorId: lecturer.id, score: dto.score, comment: dto.comment },
    });
    await this.audit(actor, 'SUPERVISOR_SCORE_CREATED', score.id, 'SupervisorScore');
    return score;
  }

  async updateSupervisorScore(id: string, dto: UpdateSupervisorScoreDto, actor: AuthUser) {
    const existing = await this.prisma.supervisorScore.findUnique({ where: { id } });
    if (!existing) throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy điểm hướng dẫn', HttpStatus.NOT_FOUND);
    await this.ensureRegistrationNotLocked(existing.defenseRegistrationId);
    await this.ensureResultNotPublishedByRegistration(existing.defenseRegistrationId);
    const lecturer = await this.getLecturerByUserId(actor.id);
    if (existing.supervisorId !== lecturer.id) throw new AppException('DEFENSE_REGISTRATION_NOT_ALLOWED', 'GVHD không có quyền sửa điểm này', HttpStatus.FORBIDDEN);
    if (typeof dto.score === 'number') this.validateScore(dto.score, 'SUPERVISOR_SCORE_INVALID');
    const updated = await this.prisma.supervisorScore.update({ where: { id }, data: { score: dto.score, comment: dto.comment } });
    await this.audit(actor, 'SUPERVISOR_SCORE_UPDATED', id, 'SupervisorScore');
    return updated;
  }

  async getSupervisorScore(defenseRegistrationId: string, actor: AuthUser) {
    const registration = await this.prisma.defenseRegistration.findUnique({ where: { id: defenseRegistrationId }, include: { student: true, supervisor: true } });
    if (!registration) throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ', HttpStatus.NOT_FOUND);
    if (!actor.roles.includes('ADMIN') && !actor.roles.includes('FACULTY_MANAGER') && registration.student.userId !== actor.id && registration.supervisor.userId !== actor.id) {
      throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy điểm hướng dẫn', HttpStatus.NOT_FOUND);
    }
    return this.prisma.supervisorScore.findUnique({ where: { defenseRegistrationId } });
  }

  async createReviewerScore(dto: CreateReviewerScoreDto, actor: AuthUser) {
    const assignment = await this.prisma.reviewerAssignment.findUnique({ where: { id: dto.reviewerAssignmentId }, include: { reviewer: true } });
    if (!assignment) throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy phân công phản biện', HttpStatus.NOT_FOUND);
    await this.ensureRegistrationNotLocked(assignment.defenseRegistrationId);
    await this.ensureResultNotPublishedByRegistration(assignment.defenseRegistrationId);
    const lecturer = await this.getLecturerByUserId(actor.id);
    if (assignment.reviewerId !== lecturer.id) throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy phân công phản biện của bạn', HttpStatus.NOT_FOUND);
    this.validateScore(dto.score, 'REVIEWER_SCORE_INVALID');

    const score = await this.prisma.reviewerScore.upsert({
      where: { reviewerAssignmentId: assignment.id },
      update: { score: dto.score, comment: dto.comment },
      create: { reviewerAssignmentId: assignment.id, reviewerId: lecturer.id, score: dto.score, comment: dto.comment },
    });
    await this.audit(actor, 'REVIEWER_SCORE_CREATED', score.id, 'ReviewerScore');
    return score;
  }

  async updateReviewerScore(id: string, dto: UpdateReviewerScoreDto, actor: AuthUser) {
    const existing = await this.prisma.reviewerScore.findUnique({ where: { id }, include: { reviewerAssignment: true } });
    if (!existing) throw new AppException('REVIEWER_SCORE_INVALID', 'Không tìm thấy điểm phản biện', HttpStatus.NOT_FOUND);
    await this.ensureRegistrationNotLocked(existing.reviewerAssignment.defenseRegistrationId);
    await this.ensureResultNotPublishedByRegistration(existing.reviewerAssignment.defenseRegistrationId);
    const lecturer = await this.getLecturerByUserId(actor.id);
    if (existing.reviewerId !== lecturer.id) throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không có quyền sửa điểm phản biện này', HttpStatus.NOT_FOUND);
    if (typeof dto.score === 'number') this.validateScore(dto.score, 'REVIEWER_SCORE_INVALID');
    const updated = await this.prisma.reviewerScore.update({ where: { id }, data: { score: dto.score, comment: dto.comment } });
    await this.audit(actor, 'REVIEWER_SCORE_UPDATED', id, 'ReviewerScore');
    return updated;
  }

  async getReviewerScore(reviewerAssignmentId: string, actor: AuthUser) {
    const assignment = await this.prisma.reviewerAssignment.findUnique({ where: { id: reviewerAssignmentId }, include: { student: true, supervisor: true, reviewer: true } });
    if (!assignment) throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy phân công phản biện', HttpStatus.NOT_FOUND);
    if (!actor.roles.includes('ADMIN') && !actor.roles.includes('FACULTY_MANAGER') && assignment.student.userId !== actor.id && assignment.supervisor.userId !== actor.id && assignment.reviewer.userId !== actor.id) {
      throw new AppException('REVIEWER_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy điểm phản biện', HttpStatus.NOT_FOUND);
    }
    return this.prisma.reviewerScore.findUnique({ where: { reviewerAssignmentId } });
  }

  async listCouncilScores(defenseScheduleId: string, actor: AuthUser) {
    const schedule = await this.getScheduleForCouncilAccess(defenseScheduleId, actor);
    return this.prisma.councilScore.findMany({
      where: { defenseScheduleId: schedule.id },
      include: { councilMember: { include: { lecturer: { include: { user: true } } } }, lecturer: { include: { user: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createCouncilScore(dto: CreateCouncilScoreDto, actor: AuthUser) {
    this.validateScore(dto.score, 'COUNCIL_SCORE_INVALID');
    const schedule = await this.prisma.defenseSchedule.findUnique({
      where: { id: dto.defenseScheduleId },
      include: { council: { include: { members: true } }, defenseDocument: true, defenseRegistration: true },
    });
    if (!schedule) throw new AppException('DEFENSE_SCHEDULE_NOT_FOUND', 'Không tìm thấy lịch bảo vệ', HttpStatus.NOT_FOUND);
    if (schedule.defenseDocument?.status !== DefenseDocumentStatus.APPROVED) {
      throw new AppException('SCORE_CALCULATION_NOT_ALLOWED', 'Hồ sơ bảo vệ chưa được thư ký xác nhận hợp lệ', HttpStatus.BAD_REQUEST);
    }
    await this.recordLockService.checkProjectRecordLocked(schedule.studentId, schedule.projectPeriodId);
    await this.ensureResultNotPublishedByRegistration(schedule.defenseRegistrationId);

    const targetMember = schedule.council.members.find((member) => member.id === dto.councilMemberId);
    if (!targetMember) throw new AppException('COUNCIL_MEMBER_NOT_IN_COUNCIL', 'Thành viên không thuộc hội đồng này', HttpStatus.FORBIDDEN);
    await this.ensureCouncilScoringPermission(schedule, targetMember, actor);

    const score = await this.prisma.councilScore.upsert({
      where: { defenseScheduleId_councilMemberId: { defenseScheduleId: schedule.id, councilMemberId: targetMember.id } },
      update: { score: dto.score, comment: dto.comment, lecturerId: targetMember.lecturerId, createdById: actor.id },
      create: {
        defenseScheduleId: schedule.id,
        defenseRegistrationId: schedule.defenseRegistrationId,
        councilId: schedule.councilId,
        councilMemberId: targetMember.id,
        lecturerId: targetMember.lecturerId,
        score: dto.score,
        comment: dto.comment,
        createdById: actor.id,
      },
    });
    await this.audit(actor, 'COUNCIL_SCORE_CREATED', score.id, 'CouncilScore');
    return score;
  }

  async updateCouncilScore(id: string, dto: UpdateCouncilScoreDto, actor: AuthUser) {
    const existing = await this.prisma.councilScore.findUnique({ where: { id }, include: { defenseSchedule: { include: { council: { include: { members: true } } } }, councilMember: true } });
    if (!existing) throw new AppException('COUNCIL_SCORE_NOT_FOUND', 'Không tìm thấy điểm hội đồng', HttpStatus.NOT_FOUND);
    await this.ensureRegistrationNotLocked(existing.defenseRegistrationId);
    await this.ensureResultNotPublishedByRegistration(existing.defenseRegistrationId);
    await this.ensureCouncilScoringPermission(existing.defenseSchedule, existing.councilMember, actor);
    if (typeof dto.score === 'number') this.validateScore(dto.score, 'COUNCIL_SCORE_INVALID');
    const updated = await this.prisma.councilScore.update({ where: { id }, data: { score: dto.score, comment: dto.comment } });
    await this.audit(actor, 'COUNCIL_SCORE_UPDATED', id, 'CouncilScore');
    return updated;
  }

  async calculateScoreSummary(defenseRegistrationId: string, actor: AuthUser) {
    if (!actor.roles.includes('FACULTY_MANAGER') && !actor.roles.includes('ADMIN')) {
      throw new AppException('AUTH_FORBIDDEN', 'Chỉ Khoa/Trưởng ngành được tính điểm tổng hợp', HttpStatus.FORBIDDEN);
    }
    const registration = await this.prisma.defenseRegistration.findUnique({
      where: { id: defenseRegistrationId },
      include: {
        supervisorScore: true,
        reviewerAssignment: { include: { reviewerScore: true } },
        defenseSchedule: { include: { councilScores: true } },
      },
    });
    if (!registration) throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(registration.studentId, registration.projectPeriodId);
    if (!registration.supervisorScore) throw new AppException('SCORE_MISSING_SUPERVISOR', 'Thiếu điểm GVHD', HttpStatus.BAD_REQUEST);
    if (!registration.reviewerAssignment?.reviewerScore) throw new AppException('SCORE_MISSING_REVIEWER', 'Thiếu điểm GVPB', HttpStatus.BAD_REQUEST);
    if (!registration.defenseSchedule || registration.defenseSchedule.councilScores.length === 0) {
      throw new AppException('SCORE_MISSING_COUNCIL', 'Thiếu điểm hội đồng', HttpStatus.BAD_REQUEST);
    }

    const supervisorScore = registration.supervisorScore.score;
    const reviewerScore = registration.reviewerAssignment.reviewerScore.score;
    const councilAverageScore = this.round(registration.defenseSchedule.councilScores.reduce((sum, item) => sum + item.score, 0) / registration.defenseSchedule.councilScores.length);
    const finalScore = this.round((councilAverageScore * 2 + supervisorScore + reviewerScore) / 4);

    const summary = await this.prisma.scoreSummary.upsert({
      where: { defenseRegistrationId: registration.id },
      update: { supervisorScore, reviewerScore, councilAverageScore, finalScore, calculatedById: actor.id, calculatedAt: new Date() },
      create: { defenseRegistrationId: registration.id, defenseScheduleId: registration.defenseSchedule.id, supervisorScore, reviewerScore, councilAverageScore, finalScore, calculatedById: actor.id },
    });
    await this.audit(actor, 'SCORE_SUMMARY_CALCULATED', summary.id, 'ScoreSummary');
    return summary;
  }

  async getScoreSummary(defenseRegistrationId: string, actor: AuthUser) {
    const registration = await this.prisma.defenseRegistration.findUnique({ where: { id: defenseRegistrationId }, include: { student: true, supervisor: true, reviewerAssignment: { include: { reviewer: true } } } });
    if (!registration) throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ', HttpStatus.NOT_FOUND);
    const allowed = actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER') || registration.student.userId === actor.id || registration.supervisor.userId === actor.id || registration.reviewerAssignment?.reviewer.userId === actor.id;
    if (!allowed) throw new AppException('RESULT_ACCESS_DENIED', 'Bạn không có quyền xem điểm tổng hợp', HttpStatus.FORBIDDEN);
    const summary = await this.prisma.scoreSummary.findUnique({ where: { defenseRegistrationId } });
    if (summary) return summary;
    return this.calculateScorePreview(defenseRegistrationId);
  }

  private async calculateScorePreview(defenseRegistrationId: string) {
    const registration = await this.prisma.defenseRegistration.findUnique({
      where: { id: defenseRegistrationId },
      include: { supervisorScore: true, reviewerAssignment: { include: { reviewerScore: true } }, defenseSchedule: { include: { councilScores: true } } },
    });
    return {
      supervisorScore: registration?.supervisorScore?.score ?? null,
      reviewerScore: registration?.reviewerAssignment?.reviewerScore?.score ?? null,
      councilAverageScore: registration?.defenseSchedule?.councilScores.length ? this.round(registration.defenseSchedule.councilScores.reduce((sum, item) => sum + item.score, 0) / registration.defenseSchedule.councilScores.length) : null,
      finalScore: null,
    };
  }

  private async ensureCouncilScoringPermission(schedule: { councilId: string; council: { members: { id: string; userId: string; lecturerId: string; roleInCouncil: CouncilRole }[] } }, targetMember: { id: string; userId: string; lecturerId: string; roleInCouncil: CouncilRole }, actor: AuthUser) {
    if (actor.roles.includes('ADMIN')) return;
    const currentMembership = schedule.council.members.find((member) => member.userId === actor.id);
    if (!currentMembership) throw new AppException('COUNCIL_MEMBER_NOT_IN_COUNCIL', 'Bạn không thuộc hội đồng này', HttpStatus.FORBIDDEN);
    if (actor.roles.includes('COUNCIL_SECRETARY') && currentMembership.roleInCouncil === CouncilRole.SECRETARY) return;
    if (actor.roles.includes('COUNCIL_MEMBER') && targetMember.userId === actor.id) return;
    throw new AppException('COUNCIL_MEMBER_NOT_IN_COUNCIL', 'Bạn không có quyền nhập điểm cho thành viên này', HttpStatus.FORBIDDEN);
  }

  private async getScheduleForCouncilAccess(defenseScheduleId: string, actor: AuthUser) {
    const schedule = await this.prisma.defenseSchedule.findUnique({
      where: { id: defenseScheduleId },
      include: { council: { include: { members: true } } },
    });
    if (!schedule) throw new AppException('DEFENSE_SCHEDULE_NOT_FOUND', 'Không tìm thấy lịch bảo vệ', HttpStatus.NOT_FOUND);
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return schedule;
    if (!schedule.council.members.some((member) => member.userId === actor.id)) {
      throw new AppException('COUNCIL_MEMBER_NOT_IN_COUNCIL', 'Bạn không thuộc hội đồng này', HttpStatus.FORBIDDEN);
    }
    return schedule;
  }

  private async ensureRegistrationNotLocked(defenseRegistrationId: string) {
    const registration = await this.prisma.defenseRegistration.findUnique({ where: { id: defenseRegistrationId }, select: { studentId: true, projectPeriodId: true } });
    if (!registration) throw new AppException('DEFENSE_REGISTRATION_NOT_FOUND', 'Không tìm thấy hồ sơ bảo vệ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(registration.studentId, registration.projectPeriodId);
  }

  private async ensureResultNotPublishedByRegistration(defenseRegistrationId: string) {
    const result = await this.prisma.finalResult.findUnique({ where: { defenseRegistrationId } });
    if (result?.publicationStatus === ResultPublicationStatus.PUBLISHED) {
      throw new AppException('FINAL_RESULT_ALREADY_PUBLISHED', 'Kết quả đã công bố, không được sửa điểm', HttpStatus.CONFLICT);
    }
  }

  private validateScore(score: number, errorCode: string) {
    if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 10) {
      throw new AppException(errorCode, 'Điểm phải nằm trong khoảng 0 đến 10', HttpStatus.BAD_REQUEST);
    }
  }

  private async getLecturerByUserId(userId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { userId } });
    if (!lecturer) throw new AppException('SUPERVISOR_NOT_FOUND', 'Không tìm thấy hồ sơ giảng viên', HttpStatus.NOT_FOUND);
    return lecturer;
  }

  private round(value: number) {
    const factor = 10 ** DECIMAL_PLACES;
    return Math.round(value * factor) / factor;
  }

  inferResultStatus(finalScore: number, revisionRequired?: boolean) {
    if (finalScore < PASSING_SCORE) return FinalResultStatus.FAILED;
    return revisionRequired ? FinalResultStatus.PASSED_WITH_REVISION : FinalResultStatus.PASSED;
  }

  private async audit(actor: AuthUser, action: string, targetId: string, targetType = 'Score') {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType, targetId, result: 'SUCCESS' });
  }
}
