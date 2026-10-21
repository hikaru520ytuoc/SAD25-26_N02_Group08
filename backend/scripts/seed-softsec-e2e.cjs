'use strict';
/**
 * Disposable DEMO fixture for the project's isolated local test database.
 * Creates SV002 and a minimal valid topic / supervisor assignment / outline /
 * defense registration. Does NOT change the published SV001 fixture.
 * Run only inside the backend container: node /app/seed-softsec-e2e.cjs
 */
const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('node:crypto');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const STUDENT_CODE = 'SV002';
const STUDENT_EMAIL = 'softsec-sv002@example.invalid';
const STUDENT_NAME = 'Tran Thi B';
const PERIOD_ID = '11111111-1111-4111-8111-111111111111';

async function run() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo fixture in NODE_ENV=production');
  }
  const existing = await prisma.student.findUnique({ where: { studentCode: STUDENT_CODE }, include: { user: true } });
  if (existing) {
    if (existing.user.email !== STUDENT_EMAIL) {
      throw new Error(`Refusing: ${STUDENT_CODE} belongs to another user (${existing.user.email})`);
    }
    const existingRegs = await prisma.defenseRegistration.findMany({
      where: { studentId: existing.id },
      include: { topicRegistration: true, supervisorScore: true, finalResult: true },
    });
    if (existingRegs.length !== 1 || !existingRegs[0].topicRegistration.topicId) {
      throw new Error('Existing demo fixture is incomplete. No automatic repair or overwrite.');
    }
    console.log(JSON.stringify({
      status: 'EXISTS; NO CHANGES', studentCode: STUDENT_CODE,
      topicUUID: existingRegs[0].topicRegistration.topicId,
      registrationId: existingRegs[0].id,
      hasScore: !!existingRegs[0].supervisorScore,
      hasFinalResult: !!existingRegs[0].finalResult,
      loginForSupervisor: 'supervisor@example.com',
    }, null, 2));
    return;
  }
  const duplicateEmail = await prisma.user.findUnique({ where: { email: STUDENT_EMAIL } });
  if (duplicateEmail) throw new Error('Demo email exists but demo student does not; stop for manual review');

  const period = await prisma.projectPeriod.findUnique({ where: { id: PERIOD_ID } });
  const facultyUser = await prisma.user.findUnique({ where: { email: 'faculty@example.com' } });
  const supervisorUser = await prisma.user.findUnique({ where: { email: 'supervisor@example.com' }, include: { lecturer: true } });
  const major = await prisma.major.findUnique({ where: { code: 'KTPM' } });
  if (!period || !facultyUser || !supervisorUser?.lecturer || !major) {
    throw new Error('Base Sprint 8 demo seed missing. Run standard seed only on disposable demo database first.');
  }
  const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);

  const saved = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: {
      email: STUDENT_EMAIL, passwordHash, fullName: STUDENT_NAME,
    }});
    const student = await tx.student.create({ data: {
      userId: user.id, studentCode: STUDENT_CODE, className: 'SOFTSEC-DEMO',
      majorId: major.id, facultyId: supervisorUser.lecturer.facultyId,
    }});
    await tx.projectPeriodRegistration.create({ data: {
      studentId: student.id, projectPeriodId: period.id,
    }});
    const topic = await tx.topic.create({ data: {
      title: 'SOFTSEC DEMO ONLY - safe grade import E2E',
      description: 'Fixture riêng biệt cho bài kiểm thử An toàn phần mềm; không dùng dữ liệu thật.',
      supervisorId: supervisorUser.lecturer.id,
      projectPeriodId: period.id,
      status: 'PUBLISHED', source: 'SUPERVISOR_PROPOSED',
      maxStudents: 1, approvedById: facultyUser.id, approvedAt: new Date(), publishedAt: new Date(),
    }});
    const registration = await tx.topicRegistration.create({ data: {
      studentId: student.id, projectPeriodId: period.id,
      registrationType: 'EXISTING_TOPIC', topicId: topic.id,
      status: 'OFFICIALLY_ASSIGNED', confirmedById: facultyUser.id, confirmedAt: new Date(),
    }});
    const assignment = await tx.supervisorAssignment.create({ data: {
      studentId: student.id, topicRegistrationId: registration.id,
      topicId: topic.id, projectPeriodId: period.id,
      supervisorId: supervisorUser.lecturer.id, assignedById: facultyUser.id,
      assignmentType: 'TOPIC_OWNER', status: 'ACTIVE',
    }});
    const outline = await tx.outline.create({ data: {
      topicRegistrationId: registration.id,
      supervisorAssignmentId: assignment.id,
      studentId: student.id, supervisorId: supervisorUser.lecturer.id,
      projectPeriodId: period.id, title: topic.title,
      summary: 'Outline demonstration; no real student data.', status: 'APPROVED',
    }});
    const defense = await tx.defenseRegistration.create({ data: {
      studentId: student.id, supervisorId: supervisorUser.lecturer.id,
      supervisorAssignmentId: assignment.id, topicRegistrationId: registration.id,
      outlineId: outline.id, projectPeriodId: period.id,
      title: topic.title, status: 'APPROVED_BY_SUPERVISOR',
      supervisorReviewedById: supervisorUser.id, supervisorReviewedAt: new Date(),
    }});
    return { topicUUID: topic.id, registrationId: defense.id };
  });
  console.log(JSON.stringify({
    status: 'CREATED', studentCode: STUDENT_CODE, studentName: STUDENT_NAME,
    ...saved, loginForSupervisor: 'supervisor@example.com',
    projectMappings: { DA002: saved.topicUUID },
    csv: 'softsec/tests/softsec_import_sv002.csv',
  }, null, 2));
}
run().catch((error) => { console.error('SOFTSEC DEMO FIXTURE FAILED:', error.message); process.exitCode=1; })
  .finally(() => prisma.$disconnect());
