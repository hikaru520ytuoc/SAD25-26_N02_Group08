import { HttpStatus, Injectable } from '@nestjs/common';
import { FinalResultStatus, ResultPublicationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ScoresService } from '../scores/scores.service';
import { RecordLockService } from '../record-lock/record-lock.service';
import { ConfirmResultDto } from './dto/confirm-result.dto';
import { QueryResultDto } from './dto/query-result.dto';

const PASSING_SCORE = 5.5;

@Injectable()
export class ResultsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoresService: ScoresService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly recordLockService: RecordLockService,
  ) {}

  async findAll(query: QueryResultDto) {
    return this.prisma.finalResult.findMany({
      where: {
        projectPeriodId: query.projectPeriodId,
        resultStatus: query.resultStatus,
        publicationStatus: query.publicationStatus,
      },
      include: this.resultInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async pendingPublication() {
    return this.prisma.finalResult.findMany({
      where: { publicationStatus: { in: [ResultPublicationStatus.DRAFT, ResultPublicationStatus.CONFIRMED] } },
      include: this.resultInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMe(actor: AuthUser) {
    const student = await this.prisma.student.findUnique({ where: { userId: actor.id } });
    if (!student) throw new AppException('STUDENT_NOT_FOUND', 'Không tìm thấy hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    const result = await this.prisma.finalResult.findFirst({ where: { studentId: student.id, publicationStatus: ResultPublicationStatus.PUBLISHED }, include: this.resultInclude(), orderBy: { publishedAt: 'desc' } });
    if (!result) throw new AppException('FINAL_RESULT_NOT_FOUND', 'Kết quả chưa được công bố', HttpStatus.NOT_FOUND);
    return result;
  }

  async getById(id: string, actor: AuthUser) {
    const result = await this.prisma.finalResult.findUnique({ where: { id }, include: this.resultInclude() });
    if (!result) throw new AppException('FINAL_RESULT_NOT_FOUND', 'Không tìm thấy kết quả', HttpStatus.NOT_FOUND);
    if (actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) return result;
    if (result.student.userId === actor.id && result.publicationStatus === ResultPublicationStatus.PUBLISHED) return result;
    throw new AppException('RESULT_ACCESS_DENIED', 'Bạn không có quyền xem kết quả này', HttpStatus.FORBIDDEN);
  }

  async generate(defenseRegistrationId: string, actor: AuthUser) {
    const summary = await this.scoresService.calculateScoreSummary(defenseRegistrationId, actor);
    const registration = await this.prisma.defenseRegistration.findUnique({
      where: { id: defenseRegistrationId },
      include: { defenseSchedule: true },
    });
    if (!registration?.defenseSchedule) throw new AppException('DEFENSE_SCHEDULE_NOT_FOUND', 'Chưa có lịch bảo vệ', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(registration.studentId, registration.projectPeriodId);
    const status = summary.finalScore < PASSING_SCORE ? FinalResultStatus.FAILED : FinalResultStatus.PASSED;
    const result = await this.prisma.finalResult.upsert({
      where: { defenseRegistrationId },
      update: {
        defenseScheduleId: registration.defenseSchedule.id,
        studentId: registration.studentId,
        projectPeriodId: registration.projectPeriodId,
        supervisorScore: summary.supervisorScore,
        reviewerScore: summary.reviewerScore,
        councilAverageScore: summary.councilAverageScore,
        finalScore: summary.finalScore,
        resultStatus: status,
        revisionRequired: false,
      },
      create: {
        defenseRegistrationId,
        defenseScheduleId: registration.defenseSchedule.id,
        studentId: registration.studentId,
        projectPeriodId: registration.projectPeriodId,
        supervisorScore: summary.supervisorScore,
        reviewerScore: summary.reviewerScore,
        councilAverageScore: summary.councilAverageScore,
        finalScore: summary.finalScore,
        resultStatus: status,
      },
      include: this.resultInclude(),
    });
    await this.audit(actor, 'FINAL_RESULT_GENERATED', result.id);
    return result;
  }

  async confirm(id: string, dto: ConfirmResultDto, actor: AuthUser) {
    const result = await this.prisma.finalResult.findUnique({ where: { id } });
    if (!result) throw new AppException('FINAL_RESULT_NOT_FOUND', 'Không tìm thấy kết quả', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(result.studentId, result.projectPeriodId);
    if (result.publicationStatus === ResultPublicationStatus.PUBLISHED) throw new AppException('FINAL_RESULT_ALREADY_PUBLISHED', 'Kết quả đã được công bố', HttpStatus.CONFLICT);
    if (dto.resultStatus === FinalResultStatus.PASSED_WITH_REVISION && !dto.revisionNote?.trim()) {
      throw new AppException('FINAL_RESULT_INVALID_STATUS', 'Cần nhập ghi chú chỉnh sửa', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.prisma.finalResult.update({
      where: { id },
      data: {
        resultStatus: dto.resultStatus,
        revisionRequired: dto.resultStatus === FinalResultStatus.PASSED_WITH_REVISION || dto.revisionRequired === true,
        revisionNote: dto.revisionNote,
        publicationStatus: ResultPublicationStatus.CONFIRMED,
        confirmedById: actor.id,
        confirmedAt: new Date(),
      },
      include: this.resultInclude(),
    });
    await this.audit(actor, 'FINAL_RESULT_CONFIRMED', id);
    return updated;
  }

  async publish(id: string, actor: AuthUser) {
    const result = await this.prisma.finalResult.findUnique({ where: { id }, include: { student: true } });
    if (!result) throw new AppException('FINAL_RESULT_NOT_FOUND', 'Không tìm thấy kết quả', HttpStatus.NOT_FOUND);
    await this.recordLockService.checkProjectRecordLocked(result.studentId, result.projectPeriodId);
    if (result.publicationStatus === ResultPublicationStatus.PUBLISHED) throw new AppException('FINAL_RESULT_ALREADY_PUBLISHED', 'Kết quả đã được công bố', HttpStatus.CONFLICT);
    if (result.publicationStatus !== ResultPublicationStatus.CONFIRMED) throw new AppException('FINAL_RESULT_NOT_CONFIRMED', 'Kết quả chưa được xác nhận', HttpStatus.BAD_REQUEST);
    const updated = await this.prisma.finalResult.update({ where: { id }, data: { publicationStatus: ResultPublicationStatus.PUBLISHED, publishedById: actor.id, publishedAt: new Date() }, include: this.resultInclude() });
    await this.notificationsService.create({ userId: result.student.userId, title: 'Kết quả bảo vệ đã được công bố', message: `Kết quả của bạn: ${updated.resultStatus}, điểm tổng kết: ${updated.finalScore}`, type: 'RESULT_PUBLISHED' });
    await this.audit(actor, 'FINAL_RESULT_PUBLISHED', id);
    return updated;
  }

  private resultInclude() {
    return { student: { include: { user: true } }, defenseRegistration: true, defenseSchedule: true } as const;
  }

  private async audit(actor: AuthUser, action: string, targetId: string) {
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action, targetType: 'FinalResult', targetId, result: 'SUCCESS' });
  }
}
