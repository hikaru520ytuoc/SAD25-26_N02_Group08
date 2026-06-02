import { PrismaClient, UserStatus } from '@prisma/client';
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
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });
  }

  for (const demoUser of demoUsers) {
    const role = await prisma.role.findUniqueOrThrow({
      where: { code: demoUser.roleCode },
    });

    const passwordHash = await bcrypt.hash(demoUser.password, 10);

    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        fullName: demoUser.fullName,
        status: UserStatus.ACTIVE,
      },
      create: {
        email: demoUser.email,
        fullName: demoUser.fullName,
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });
  }
}

main()
  .then(async () => {
    console.log('Seed completed: default roles and demo users are ready.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
