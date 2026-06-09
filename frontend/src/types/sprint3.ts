import type { ProjectPeriod, Topic } from './sprint2';

export type TopicRegistrationType = 'EXISTING_TOPIC' | 'STUDENT_PROPOSED';
export type SupervisorResponseStatus = 'NOT_REQUIRED' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type TopicRegistrationStatus =
  | 'DRAFT'
  | 'PENDING_SUPERVISOR'
  | 'PENDING_FACULTY'
  | 'NEEDS_REVISION'
  | 'FACULTY_APPROVED'
  | 'FACULTY_REJECTED'
  | 'CANCELLED'
  | 'OFFICIALLY_ASSIGNED';
export type SupervisorAssignmentStatus = 'ACTIVE' | 'CANCELLED';
export type SupervisorAssignmentType = 'TOPIC_OWNER' | 'STUDENT_REQUESTED' | 'FACULTY_ASSIGNED';

export type LecturerOption = {
  id: string;
  lecturerCode: string;
  academicRank?: string | null;
  department?: string | null;
  user: { id: string; email: string; fullName: string };
  faculty?: { id: string; code: string; name: string } | null;
};

export type TopicRegistration = {
  id: string;
  registrationType: TopicRegistrationType;
  proposedTitle?: string | null;
  proposedDescription?: string | null;
  proposedObjectives?: string | null;
  proposedExpectedOutput?: string | null;
  proposedMajor?: string | null;
  supervisorResponseStatus: SupervisorResponseStatus;
  supervisorResponseNote?: string | null;
  status: TopicRegistrationStatus;
  facultyNote?: string | null;
  rejectedReason?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    studentCode: string;
    className: string;
    major: string;
    user: { id: string; email: string; fullName: string };
  };
  projectPeriod: ProjectPeriod;
  topic?: Topic | null;
  requestedSupervisor?: LecturerOption | null;
  confirmedBy?: { id: string; email: string; fullName: string } | null;
  supervisorAssignment?: SupervisorAssignment | null;
};

export type SupervisorAssignment = {
  id: string;
  assignmentType: SupervisorAssignmentType;
  status: SupervisorAssignmentStatus;
  assignedAt: string;
  student: TopicRegistration['student'];
  supervisor: LecturerOption;
  topic?: Topic | null;
  projectPeriod: ProjectPeriod;
  topicRegistration?: TopicRegistration;
  assignedBy?: { id: string; email: string; fullName: string } | null;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
};
