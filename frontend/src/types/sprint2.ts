export type ProjectPeriodStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
export type InternshipStatus = 'NOT_COMPLETED' | 'COMPLETED' | 'WAIVED';
export type EligibilityStatus = 'PENDING' | 'ELIGIBLE' | 'NOT_ELIGIBLE';
export type AcademicStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED';
export type TopicStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'CLOSED';

export type ProjectPeriod = {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  status: ProjectPeriodStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { eligibilities: number; topics: number };
};

export type StudentEligibility = {
  id: string;
  internshipStatus: InternshipStatus;
  academicStatus: AcademicStatus;
  completedCredits?: number | null;
  requiredCredits?: number | null;
  gpa?: number | null;
  hasPrerequisiteDebt: boolean;
  hasTuitionDebt: boolean;
  hasDisciplinaryAction: boolean;
  eligibilityStatus: EligibilityStatus;
  reason?: string | null;
  checkedAt?: string | null;
  student: {
    id: string;
    studentCode: string;
    className: string;
    major: string;
    user: { email: string; fullName: string };
  };
  projectPeriod: ProjectPeriod;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  objectives?: string | null;
  expectedOutput?: string | null;
  major?: string | null;
  maxStudents: number;
  status: TopicStatus;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  projectPeriod: ProjectPeriod;
  supervisor: {
    lecturerCode: string;
    academicRank?: string | null;
    department?: string | null;
    user: { id: string; email: string; fullName: string };
  };
  approvedBy?: { email: string; fullName: string } | null;
};
