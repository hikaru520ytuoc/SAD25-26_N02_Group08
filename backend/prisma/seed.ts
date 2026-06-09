import {
  AcademicStatus,
  EligibilityStatus,
  InternshipStatus,
  PrismaClient,
  ProjectPeriodStatus,
  TopicSource,
  TopicStatus,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const roles = [
  { code: 'ADMIN', name: 'Administrator', description: 'Quản trị hệ thống' },
  { code: 'STUDENT', name: 'Student', description: 'Sinh viên' },
  { code: 'SUPERVISOR', name: 'Supervisor', description: 'Giảng viên hướng dẫn' },
  { code: 'REVIEWER', name: 'Reviewer', description: 'Giảng viên phản biện' },
  { code: 'COUNCIL_MEMBER', name: 'Council Member', description: 'Thành viên hội đồng bảo vệ' },
  { code: 'COUNCIL_SECRETARY', name: 'Council Secretary', description: 'Thư ký hội đồng' },
  { code: 'FACULTY_MANAGER', name: 'Faculty Manager', description: 'Trưởng ngành/Khoa phụ trách đồ án' },
  { code: 'ARCHIVE_STAFF', name: 'Archive Staff', description: 'Bộ phận lưu trữ/Khoa' },
];

const demoUsers = [
  { email: 'admin@example.com', password: 'Admin@123456', fullName: 'Demo Admin', roleCode: 'ADMIN' },
  { email: 'student@example.com', password: 'Student@123456', fullName: 'Demo Student', roleCode: 'STUDENT' },
  { email: 'supervisor@example.com', password: 'Supervisor@123456', fullName: 'Demo Supervisor', roleCode: 'SUPERVISOR' },
  { email: 'faculty@example.com', password: 'Faculty@123456', fullName: 'Demo Faculty Manager', roleCode: 'FACULTY_MANAGER' },
  { email: 'supervisor2@example.com', password: 'Supervisor2@123456', fullName: 'Demo Supervisor 2', roleCode: 'SUPERVISOR' },
];

async function ensureDemoUser(email: string, password: string, fullName: string, roleCode: string) {
  const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { fullName, status: UserStatus.ACTIVE },
    create: { email, fullName, passwordHash, status: UserStatus.ACTIVE },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  return user;
}

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }

  const users: Record<string, Awaited<ReturnType<typeof ensureDemoUser>>> = {};
  for (const demoUser of demoUsers) {
    users[demoUser.email === 'supervisor2@example.com' ? 'SUPERVISOR2' : demoUser.roleCode] = await ensureDemoUser(
      demoUser.email,
      demoUser.password,
      demoUser.fullName,
      demoUser.roleCode,
    );
  }

  const faculty = await prisma.faculty.upsert({
    where: { code: 'FIT' },
    update: { name: 'Khoa Công nghệ thông tin', description: 'Faculty seed for Sprint 2 demo' },
    create: { code: 'FIT', name: 'Khoa Công nghệ thông tin', description: 'Faculty seed for Sprint 2 demo' },
  });

  const student = await prisma.student.upsert({
    where: { studentCode: 'SV001' },
    update: {
      userId: users.STUDENT.id,
      className: 'KTPM01',
      major: 'Software Engineering',
      facultyId: faculty.id,
      internshipStatus: InternshipStatus.COMPLETED,
    },
    create: {
      userId: users.STUDENT.id,
      studentCode: 'SV001',
      className: 'KTPM01',
      major: 'Software Engineering',
      facultyId: faculty.id,
      internshipStatus: InternshipStatus.COMPLETED,
    },
  });

  const lecturer = await prisma.lecturer.upsert({
    where: { lecturerCode: 'GV001' },
    update: {
      userId: users.SUPERVISOR.id,
      academicRank: 'MASTER',
      department: 'Software Engineering',
      facultyId: faculty.id,
      maxSupervisedStudents: 10,
    },
    create: {
      userId: users.SUPERVISOR.id,
      lecturerCode: 'GV001',
      academicRank: 'MASTER',
      department: 'Software Engineering',
      facultyId: faculty.id,
      maxSupervisedStudents: 10,
    },
  });

  const lecturer2 = await prisma.lecturer.upsert({
    where: { lecturerCode: 'GV002' },
    update: {
      userId: users.SUPERVISOR2.id,
      academicRank: 'DOCTOR',
      department: 'Software Engineering',
      facultyId: faculty.id,
      maxSupervisedStudents: 8,
    },
    create: {
      userId: users.SUPERVISOR2.id,
      lecturerCode: 'GV002',
      academicRank: 'DOCTOR',
      department: 'Software Engineering',
      facultyId: faculty.id,
      maxSupervisedStudents: 8,
    },
  });

  const period = await prisma.projectPeriod.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {
      name: 'Đợt đồ án tốt nghiệp học kỳ 1 năm 2025-2026',
      academicYear: '2025-2026',
      semester: 'HK1',
      status: ProjectPeriodStatus.OPEN,
    },
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Đợt đồ án tốt nghiệp học kỳ 1 năm 2025-2026',
      academicYear: '2025-2026',
      semester: 'HK1',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-01-15'),
      registrationStartDate: new Date('2025-09-05'),
      registrationEndDate: new Date('2025-09-30'),
      status: ProjectPeriodStatus.OPEN,
      createdById: users.FACULTY_MANAGER.id,
    },
  });

  await prisma.studentEligibility.upsert({
    where: { studentId_projectPeriodId: { studentId: student.id, projectPeriodId: period.id } },
    update: {
      internshipStatus: InternshipStatus.COMPLETED,
      academicStatus: AcademicStatus.ACTIVE,
      eligibilityStatus: EligibilityStatus.ELIGIBLE,
      checkedById: users.FACULTY_MANAGER.id,
      checkedAt: new Date(),
    },
    create: {
      studentId: student.id,
      projectPeriodId: period.id,
      internshipStatus: InternshipStatus.COMPLETED,
      academicStatus: AcademicStatus.ACTIVE,
      eligibilityStatus: EligibilityStatus.ELIGIBLE,
      checkedById: users.FACULTY_MANAGER.id,
      checkedAt: new Date(),
    },
  });

  const existingTopic = await prisma.topic.findFirst({
    where: {
      title: 'Xây dựng hệ thống quản lý đồ án tốt nghiệp',
      projectPeriodId: period.id,
      supervisorId: lecturer.id,
    },
  });

  if (existingTopic) {
    await prisma.topic.update({
      where: { id: existingTopic.id },
      data: {
        description: 'Đề tài demo phục vụ Sprint 2',
        expectedOutput: 'Web application quản lý đồ án tốt nghiệp',
        major: 'Software Engineering',
        maxStudents: 1,
        status: TopicStatus.PUBLISHED,
        source: TopicSource.SUPERVISOR_PROPOSED,
        approvedById: users.FACULTY_MANAGER.id,
        approvedAt: new Date(),
        publishedAt: new Date(),
      },
    });
  } else {
    await prisma.topic.create({
      data: {
        title: 'Xây dựng hệ thống quản lý đồ án tốt nghiệp',
        description: 'Đề tài demo phục vụ Sprint 2',
        objectives: 'Xây dựng hệ thống web hỗ trợ quản lý quy trình đồ án tốt nghiệp',
        expectedOutput: 'Web application quản lý đồ án tốt nghiệp',
        major: 'Software Engineering',
        maxStudents: 1,
        supervisorId: lecturer.id,
        projectPeriodId: period.id,
        status: TopicStatus.PUBLISHED,
        source: TopicSource.SUPERVISOR_PROPOSED,
        approvedById: users.FACULTY_MANAGER.id,
        approvedAt: new Date(),
        publishedAt: new Date(),
      },
    });
  }

  const sprint3Topic = await prisma.topic.findFirst({
    where: {
      title: 'Xây dựng hệ thống theo dõi tiến độ đồ án',
      projectPeriodId: period.id,
      supervisorId: lecturer2.id,
    },
  });

  if (sprint3Topic) {
    await prisma.topic.update({
      where: { id: sprint3Topic.id },
      data: {
        description: 'Đề tài demo phục vụ Sprint 3',
        objectives: 'Theo dõi tiến độ sinh viên trong quá trình làm đồ án',
        expectedOutput: 'Module quản lý tiến độ đồ án',
        major: 'Software Engineering',
        maxStudents: 2,
        status: TopicStatus.PUBLISHED,
        source: TopicSource.SUPERVISOR_PROPOSED,
        approvedById: users.FACULTY_MANAGER.id,
        approvedAt: new Date(),
        publishedAt: new Date(),
      },
    });
  } else {
    await prisma.topic.create({
      data: {
        title: 'Xây dựng hệ thống theo dõi tiến độ đồ án',
        description: 'Đề tài demo phục vụ Sprint 3',
        objectives: 'Theo dõi tiến độ sinh viên trong quá trình làm đồ án',
        expectedOutput: 'Module quản lý tiến độ đồ án',
        major: 'Software Engineering',
        maxStudents: 2,
        supervisorId: lecturer2.id,
        projectPeriodId: period.id,
        status: TopicStatus.PUBLISHED,
        source: TopicSource.SUPERVISOR_PROPOSED,
        approvedById: users.FACULTY_MANAGER.id,
        approvedAt: new Date(),
        publishedAt: new Date(),
      },
    });
  }
}

main()
  .then(async () => {
    console.log('Seed completed: roles, demo users and Sprint 3 demo data are ready.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
