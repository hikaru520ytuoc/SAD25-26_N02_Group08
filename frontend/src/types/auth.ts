export type Role = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export type Major = {
  id: string;
  code: string;
  name: string;
  totalCredits: number;
};

export type StudentAcademicEligibility = {
  eligible: boolean;
  requiredCredits: number;
  creditRatio: number;
  minimumGpa: number;
  checks: {
    credits: boolean;
    gpa: boolean;
    internship: boolean;
    academicStatus: boolean;
    prerequisiteDebt: boolean;
    tuitionDebt: boolean;
    disciplinaryAction: boolean;
    accountStatus: boolean;
  };
  reasons: string[];
};

export type StudentProfile = {
  id: string;
  studentCode: string;
  className: string;
  majorId: string;
  major: Major;
  facultyId?: string | null;
  faculty?: { id: string; code: string; name: string } | null;
  internshipStatus: 'NOT_COMPLETED' | 'COMPLETED' | 'WAIVED';
  academicStatus: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED';
  accumulatedCredits: number;
  gpa: number;
  hasPrerequisiteDebt: boolean;
  hasTuitionDebt: boolean;
  hasDisciplinaryAction: boolean;
  eligibility?: StudentAcademicEligibility;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  status: 'ACTIVE' | 'LOCKED';
  roles: string[];
  phone?: string | null;
  avatarUrl?: string | null;
  student?: StudentProfile | null;
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
  student?: StudentProfile | null;
  lecturer?: {
    id: string;
    lecturerCode: string;
    academicRank?: string | null;
    department?: string | null;
    maxSupervisedStudents?: number | null;
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
