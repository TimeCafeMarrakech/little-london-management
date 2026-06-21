export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "sick";

export type AttendanceSessionStatus = "draft" | "submitted" | "reviewed" | "locked" | "archived";

export type AttendanceMetrics = {
  todaysSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  pendingSessions: number;
  completionRate: number;
};

export type AttendanceClassOption = {
  id: string;
  label: string;
  helper: string;
};

export type AttendanceSessionListItem = {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  courseName: string;
  sessionDate: string;
  status: AttendanceSessionStatus;
  recordCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  submittedAt: string | null;
  reviewedAt: string | null;
  lockedAt: string | null;
};

export type AttendanceRecordItem = {
  id: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  studentEnrolmentId: string;
  status: AttendanceStatus;
  arrivalTime: string | null;
  notes: string | null;
};

export type AttendanceCorrectionItem = {
  id: string;
  attendanceRecordId: string;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  correctionReason: string;
  correctedAt: string;
};

export type AttendanceSessionDetail = AttendanceSessionListItem & {
  records: AttendanceRecordItem[];
  corrections: AttendanceCorrectionItem[];
  canEdit: boolean;
  canSubmit: boolean;
  canReview: boolean;
  canLock: boolean;
  canCorrect: boolean;
};

export type AttendanceHistoryItem = {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  sessionDate: string;
  status: AttendanceStatus;
  sessionStatus: AttendanceSessionStatus;
};

export type AttendanceListResult = {
  sessions: AttendanceSessionListItem[];
  metrics: AttendanceMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type AttendanceActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
