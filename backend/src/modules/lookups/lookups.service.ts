import { Injectable } from '@nestjs/common';
import {
  DefenseCouncilStatus,
  DefenseRegistrationStatus,
  DefenseScheduleStatus,
  FinalResultStatus,
  ProjectPeriodStatus,
  ResultPublicationStatus,
  TopicStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type LookupOption = {
  id: string;
  label: string;
  subLabel?: string | null;
  code?: string | null;
  status?: string | null;
  disabled?: boolean;
  disabledReason?: string | null;
  meta?: Record<string, unknown>;
};

function shortCode(prefix: string, id: string, date?: Date | string | null) {
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear();
  return `${prefix}-${year}-${id.slice(0, 6).toUpperCase()}`;
}

function containsSearch(search?: string) {
  return search?.trim() ? { contains: search.trim(), mode: 'insensitive' as const } : undefined;
}

@Injectable()
export class LookupsService {
  constructor(private readonly prisma: PrismaService) {}

  async projectPeriods(status?: string): Promise<LookupOption[]> {
    const items = await this.prisma.projectPeriod.findMany({
      where: status ? { status: status as ProjectPeriodStatus } : undefined,
      orderBy: [{ academicYear: 'desc' }, { semester: 'asc' }],
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: shortCode('DOT', item.id, item.createdAt),
      label: `${item.name} - ${item.academicYear} - ${item.semester}`,
      subLabel: `Trạng thái: ${item.status}`,
      status: item.status,
    }));
  }

  async students(search?: string, projectPeriodId?: string): Promise<LookupOption[]> {
    const searchCondition = containsSearch(search);
    const items = await this.prisma.student.findMany({
      where: {
        ...(projectPeriodId
          ? {
              eligibilities: {
                none: { projectPeriodId },
              },
            }
          : {}),
        ...(searchCondition
          ? {
              OR: [
                { studentCode: searchCondition },
                { className: searchCondition },
                { major: searchCondition },
                { user: { fullName: searchCondition } },
                { user: { email: searchCondition } },
              ],
            }
          : {}),
      },
      include: { user: true },
      orderBy: { studentCode: 'asc' },
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: item.studentCode,
      label: `${item.studentCode} - ${item.user.fullName}`,
      subLabel: `${item.className} - ${item.major}`,
      status: item.internshipStatus,
    }));
  }

  async lecturers(role?: string, search?: string, excludeLecturerId?: string): Promise<LookupOption[]> {
    const searchCondition = containsSearch(search);
    const items = await this.prisma.lecturer.findMany({
      where: {
        ...(excludeLecturerId ? { id: { not: excludeLecturerId } } : {}),
        ...(role
          ? {
              user: {
                userRoles: {
                  some: { role: { code: role } },
                },
              },
            }
          : {}),
        ...(searchCondition
          ? {
              OR: [
                { lecturerCode: searchCondition },
                { department: searchCondition },
                { academicRank: searchCondition },
                { user: { fullName: searchCondition } },
                { user: { email: searchCondition } },
              ],
            }
          : {}),
      },
      include: { user: true, faculty: true },
      orderBy: { lecturerCode: 'asc' },
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: item.lecturerCode,
      label: `${item.lecturerCode} - ${item.user.fullName}`,
      subLabel: [item.department, item.academicRank, item.faculty?.name].filter(Boolean).join(' - ') || 'Giảng viên',
    }));
  }

  supervisors(search?: string) {
    return this.lecturers('SUPERVISOR', search);
  }

  reviewers(search?: string, excludeLecturerId?: string) {
    return this.lecturers('REVIEWER', search, excludeLecturerId);
  }

  async topics(status?: string, projectPeriodId?: string): Promise<LookupOption[]> {
    const items = await this.prisma.topic.findMany({
      where: {
        ...(status ? { status: status as TopicStatus } : {}),
        ...(projectPeriodId ? { projectPeriodId } : {}),
      },
      include: { supervisor: { include: { user: true } }, projectPeriod: true, topicRegistrations: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: shortCode('DT', item.id, item.createdAt),
      label: `${shortCode('DT', item.id, item.createdAt)} - ${item.title}`,
      subLabel: `GVHD: ${item.supervisor.user.fullName} · ${item.projectPeriod.name} · Slot còn lại: ${Math.max(item.maxStudents - item.topicRegistrations.length, 0)}`,
      status: item.status,
      disabled: item.topicRegistrations.length >= item.maxStudents,
      disabledReason: item.topicRegistrations.length >= item.maxStudents ? 'Đã đủ số lượng sinh viên' : undefined,
    }));
  }

  async councils(status?: string, projectPeriodId?: string): Promise<LookupOption[]> {
    const items = await this.prisma.defenseCouncil.findMany({
      where: {
        ...(status ? { status: status as DefenseCouncilStatus } : {}),
        ...(projectPeriodId ? { projectPeriodId } : {}),
      },
      include: { members: { include: { lecturer: { include: { user: true } } } }, schedules: true, projectPeriod: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return items.map((item) => {
      const chair = item.members.find((member) => member.roleInCouncil === 'CHAIR')?.lecturer.user.fullName;
      const secretary = item.members.find((member) => member.roleInCouncil === 'SECRETARY')?.lecturer.user.fullName;
      return {
        id: item.id,
        code: shortCode('HD', item.id, item.createdAt),
        label: `${shortCode('HD', item.id, item.createdAt)} - ${item.name}`,
        subLabel: `${item.members.length} thành viên · ${item.schedules.length} đề tài/sinh viên · CT: ${chair ?? 'chưa có'} · TK: ${secretary ?? 'chưa có'}`,
        status: item.status,
        disabled: item.schedules.length >= 6,
        disabledReason: item.schedules.length >= 6 ? 'Hội đồng đã đủ 6 đề tài/sinh viên' : undefined,
      };
    });
  }

  async defenseRegistrations(status?: string, projectPeriodId?: string): Promise<LookupOption[]> {
    const statuses = status?.includes(',') ? status.split(',') : status ? [status] : undefined;
    const items = await this.prisma.defenseRegistration.findMany({
      where: {
        ...(statuses ? { status: { in: statuses as DefenseRegistrationStatus[] } } : {}),
        ...(projectPeriodId ? { projectPeriodId } : {}),
      },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } },
        topicRegistration: { include: { topic: true } },
        reviewerAssignment: { include: { reviewer: { include: { user: true } }, reviewerScore: true } },
        supervisorScore: true,
        councilScores: true,
        defenseSchedule: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: shortCode('HSBV', item.id, item.submittedAt),
      label: `${item.student.studentCode} - ${item.student.user.fullName}`,
      subLabel: `${item.topicRegistration.topic?.title ?? item.title} · GVHD: ${item.supervisor.user.fullName} · ${item.status}`,
      status: item.status,
      meta: {
        supervisorId: item.supervisorId,
        supervisorName: item.supervisor.user.fullName,
        reviewerName: item.reviewerAssignment?.reviewer.user.fullName,
        supervisorScore: item.supervisorScore?.score,
        reviewerScore: item.reviewerAssignment?.reviewerScore?.score,
        councilScoreCount: item.councilScores.length,
        hasSchedule: Boolean(item.defenseSchedule),
      },
    }));
  }

  async defenseSchedules(councilId?: string, studentId?: string, status?: string): Promise<LookupOption[]> {
    const items = await this.prisma.defenseSchedule.findMany({
      where: {
        ...(councilId ? { councilId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(status ? { status: status as DefenseScheduleStatus } : {}),
      },
      include: { student: { include: { user: true } }, council: true, defenseRegistration: true },
      orderBy: [{ defenseDate: 'desc' }, { startTime: 'asc' }],
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: shortCode('BV', item.id, item.defenseDate),
      label: `${shortCode('BV', item.id, item.defenseDate)} - ${item.student.studentCode} ${item.student.user.fullName}`,
      subLabel: `${new Date(item.defenseDate).toLocaleDateString('vi-VN')} · ${new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}-${new Date(item.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · Phòng ${item.room} · ${item.council.name}`,
      status: item.status,
    }));
  }

  async finalResults(resultStatus?: string, publicationStatus?: string): Promise<LookupOption[]> {
    const items = await this.prisma.finalResult.findMany({
      where: {
        ...(resultStatus ? { resultStatus: resultStatus as FinalResultStatus } : {}),
        ...(publicationStatus ? { publicationStatus: publicationStatus as ResultPublicationStatus } : {}),
      },
      include: { student: { include: { user: true } }, defenseRegistration: { include: { topicRegistration: { include: { topic: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: shortCode('KQ', item.id, item.createdAt),
      label: `${item.student.studentCode} - ${item.student.user.fullName}`,
      subLabel: `${item.defenseRegistration.topicRegistration.topic?.title ?? item.defenseRegistration.title} · Điểm: ${item.finalScore.toFixed(2)} · ${item.resultStatus}/${item.publicationStatus}`,
      status: item.publicationStatus,
      meta: { finalScore: item.finalScore, resultStatus: item.resultStatus },
    }));
  }

  async archiveRecords(status?: string): Promise<LookupOption[]> {
    const items = await this.prisma.archiveRecord.findMany({
      where: status ? { status: status as any } : undefined,
      include: { student: { include: { user: true } }, finalResult: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return items.map((item) => ({
      id: item.id,
      code: shortCode('LT', item.id, item.createdAt),
      label: `${item.student.studentCode} - ${item.student.user.fullName}`,
      subLabel: `Điểm: ${item.finalResult.finalScore.toFixed(2)} · ${item.status}`,
      status: item.status,
    }));
  }

  async roles(): Promise<LookupOption[]> {
    const items = await this.prisma.role.findMany({ orderBy: { code: 'asc' } });
    return items.map((item) => ({ id: item.id, code: item.code, label: item.code, subLabel: item.name }));
  }

  async faculties(): Promise<LookupOption[]> {
    const items = await this.prisma.faculty.findMany({ orderBy: { code: 'asc' } });
    return items.map((item) => ({ id: item.id, code: item.code, label: `${item.code} - ${item.name}`, subLabel: item.description }));
  }
}
