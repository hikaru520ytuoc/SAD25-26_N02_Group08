export type DefenseCouncilStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
export type CouncilRole = 'CHAIR' | 'SECRETARY' | 'MEMBER';
export type DefenseScheduleStatus = 'SCHEDULED' | 'DOCUMENT_PENDING' | 'DOCUMENT_NEEDS_SUPPLEMENT' | 'DOCUMENT_APPROVED' | 'CANCELLED' | 'COMPLETED';
export type DefenseDocumentStatus = 'SUBMITTED' | 'NEEDS_SUPPLEMENT' | 'APPROVED';

export type CouncilMember = {
  id: string;
  lecturerId: string;
  userId: string;
  roleInCouncil: CouncilRole;
  lecturer?: { lecturerCode: string; user?: { fullName: string; email: string } };
  user?: { fullName: string; email: string };
};

export type DefenseCouncil = {
  id: string;
  name: string;
  projectPeriodId: string;
  facultyId?: string | null;
  description?: string | null;
  status: DefenseCouncilStatus;
  members?: CouncilMember[];
  projectPeriod?: { name: string; academicYear: string; semester: string };
};

export type DefenseSchedule = {
  id: string;
  defenseRegistrationId: string;
  studentId: string;
  projectPeriodId: string;
  councilId: string;
  room: string;
  defenseDate: string;
  startTime: string;
  endTime: string;
  status: DefenseScheduleStatus;
  student?: { user?: { fullName: string; email: string }; studentCode?: string };
  council?: DefenseCouncil;
  defenseRegistration?: any;
  defenseDocument?: DefenseDocument | null;
};

export type DefenseDocument = {
  id: string;
  defenseScheduleId: string;
  defenseRegistrationId: string;
  studentId: string;
  reportFileId?: string | null;
  slideFileId?: string | null;
  additionalFileId?: string | null;
  status: DefenseDocumentStatus;
  secretaryNote?: string | null;
  submittedAt: string;
  defenseSchedule?: DefenseSchedule;
  reportFile?: { id: string; originalName: string } | null;
  slideFile?: { id: string; originalName: string } | null;
  additionalFile?: { id: string; originalName: string } | null;
};
