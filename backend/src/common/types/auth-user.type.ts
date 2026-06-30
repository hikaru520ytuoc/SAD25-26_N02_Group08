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
    major: string;
    internshipStatus?: string | null;
    completedCredits?: number | null;
    requiredCredits?: number | null;
    gpa?: number | null;
    hasPrerequisiteDebt?: boolean | null;
    hasTuitionDebt?: boolean | null;
    hasDisciplinaryAction?: boolean | null;
  } | null;
  lecturer?: {
    id: string;
    lecturerCode: string;
    academicTitle?: string | null;
    specialization?: string | null;
    maxStudents?: number | null;
  } | null;
};
