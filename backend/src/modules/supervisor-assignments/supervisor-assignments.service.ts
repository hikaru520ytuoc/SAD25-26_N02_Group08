import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, SupervisorAssignmentStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { QuerySupervisorAssignmentDto } from './dto/query-supervisor-assignment.dto';

@Injectable()
export class SupervisorAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QuerySupervisorAssignmentDto = {}) {
    const where: Prisma.SupervisorAssignmentWhereInput = {
      status: SupervisorAssignmentStatus.ACTIVE,
      ...(query.projectPeriodId ? { projectPeriodId: query.projectPeriodId } : {}),
      ...(query.supervisorId ? { supervisorId: query.supervisorId } : {}),
    };

    return this.prisma.supervisorAssignment.findMany({
      where,
      include: this.assignmentInclude(),
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findMyStudents(actor: AuthUser, query: QuerySupervisorAssignmentDto = {}) {
    const lecturer = await this.getLecturerByUserId(actor.id);

    return this.prisma.supervisorAssignment.findMany({
      where: {
        status: SupervisorAssignmentStatus.ACTIVE,
        supervisorId: lecturer.id,
        ...(query.projectPeriodId ? { projectPeriodId: query.projectPeriodId } : {}),
      },
      include: this.assignmentInclude(),
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findMe(actor: AuthUser) {
    const student = await this.getStudentByUserId(actor.id);
    return this.prisma.supervisorAssignment.findMany({
      where: { studentId: student.id, status: SupervisorAssignmentStatus.ACTIVE },
      include: this.assignmentInclude(),
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const assignment = await this.prisma.supervisorAssignment.findUnique({
      where: { id },
      include: this.assignmentInclude(),
    });

    if (!assignment) {
      throw new AppException('SUPERVISOR_ASSIGNMENT_NOT_FOUND', 'Không tìm thấy phân công GVHD', HttpStatus.NOT_FOUND);
    }

    if (actor.roles.includes('FACULTY_MANAGER') || actor.roles.includes('ADMIN')) {
      return assignment;
    }

    if (actor.roles.includes('SUPERVISOR') && assignment.supervisor.userId === actor.id) {
      return assignment;
    }

    if (actor.roles.includes('STUDENT') && assignment.student.userId === actor.id) {
      return assignment;
    }

    throw new AppException('AUTH_FORBIDDEN', 'Bạn không có quyền xem phân công này', HttpStatus.FORBIDDEN);
  }

  private assignmentInclude(): Prisma.SupervisorAssignmentInclude {
    return {
      student: { include: { user: { select: { id: true, email: true, fullName: true } } } },
      supervisor: { include: { user: { select: { id: true, email: true, fullName: true } } } },
      topic: true,
      projectPeriod: true,
      topicRegistration: true,
      assignedBy: { select: { id: true, email: true, fullName: true } },
    };
  }

  private async getLecturerByUserId(userId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { userId } });
    if (!lecturer) {
      throw new AppException('SUPERVISOR_NOT_FOUND', 'Tài khoản hiện tại chưa có hồ sơ giảng viên', HttpStatus.NOT_FOUND);
    }
    return lecturer;
  }

  private async getStudentByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new AppException('STUDENT_NOT_FOUND', 'Tài khoản hiện tại chưa có hồ sơ sinh viên', HttpStatus.NOT_FOUND);
    }
    return student;
  }
}
