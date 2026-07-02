import { UserStatus } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  status: UserStatus;
  roles: string[];
  phone?: string | null;
  avatarUrl?: string | null;
  student?: {
    id: string;
    studentCode: string;
    className: string;
    majorId: string;
    major: {
      id: string;
      code: string;
      name: string;
      totalCredits: number;
    };
    internshipStatus: string;
    academicStatus: string;
    accumulatedCredits: number;
    gpa: number;
    hasPrerequisiteDebt: boolean;
    hasTuitionDebt: boolean;
    hasDisciplinaryAction: boolean;
  } | null;
  lecturer?: {
    id: string;
    lecturerCode: string;
    academicTitle?: string | null;
    specialization?: string | null;
    maxStudents?: number | null;
  } | null;
};
