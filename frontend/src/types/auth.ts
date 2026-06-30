export type Role = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  status: 'ACTIVE' | 'LOCKED';
  roles: string[];
  phone?: string | null;
  avatarUrl?: string | null;
  student?: {
    id?: string;
    studentCode?: string;
    className?: string;
    major?: string;
    internshipStatus?: string | null;
    completedCredits?: number | null;
    requiredCredits?: number | null;
    gpa?: number | null;
    hasPrerequisiteDebt?: boolean;
    hasTuitionDebt?: boolean;
    hasDisciplinaryAction?: boolean;
  } | null;
  lecturer?: {
    id?: string;
    lecturerCode?: string;
    department?: string | null;
    academicRank?: string | null;
    academicTitle?: string | null;
    specialization?: string | null;
    maxStudents?: number | null;
  } | null;
};

export type UserListItem = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'LOCKED';
  roles: Role[];
  student?: {
    id: string;
    studentCode: string;
    className: string;
    major: string;
    completedCredits?: number | null;
    requiredCredits?: number | null;
    gpa?: number | null;
    hasPrerequisiteDebt: boolean;
    hasTuitionDebt: boolean;
    hasDisciplinaryAction: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  errorCode: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
};
