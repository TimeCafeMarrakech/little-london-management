export type StudentStatus = "active" | "inactive" | "archived";

export type StudentListItem = {
  id: string;
  studentNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  status: StudentStatus;
  primaryLanguage: string | null;
  schoolName: string | null;
  parentCount: number;
  emergencyContactCount: number;
  allergyCount: number;
};

export type ParentRelationshipSummary = {
  id: string;
  parentFullName: string;
  parentEmail: string | null;
  parentPhone: string | null;
  relationshipType: string;
  isPrimaryContact: boolean;
  canPickUp: boolean;
  receivesInvoices: boolean;
  receivesAnnouncements: boolean;
};

export type EmergencyContactSummary = {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  alternatePhone: string | null;
  priority: number;
  notes: string | null;
};

export type AllergySummary = {
  id: string;
  allergen: string;
  severity: "unknown" | "mild" | "moderate" | "severe";
  reaction: string | null;
  treatment: string | null;
  notes: string | null;
};

export type MedicalProfileSummary = {
  doctorName: string | null;
  doctorPhone: string | null;
  insuranceProvider: string | null;
  policyNumber: string | null;
  medicalConditions: string | null;
  medicationNotes: string | null;
  dietaryRequirements: string | null;
  emergencyMedicalConsent: boolean;
};

export type StudentStatusHistoryItem = {
  id: string;
  fromStatus: StudentStatus | null;
  toStatus: StudentStatus;
  reason: string | null;
  changedAt: string;
};

export type StudentEnrolmentSummary = {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  courseName: string;
  enrolmentDate: string;
  status: "active" | "completed" | "withdrawn" | "archived";
};

export type StudentDetail = StudentListItem & {
  gender: string | null;
  medicalNotes: string | null;
  emergencyNotes: string | null;
  parents: ParentRelationshipSummary[];
  emergencyContacts: EmergencyContactSummary[];
  allergies: AllergySummary[];
  medicalProfile: MedicalProfileSummary | null;
  statusHistory: StudentStatusHistoryItem[];
  enrolments: StudentEnrolmentSummary[];
  attendanceHistory: {
    id: string;
    classId: string;
    className: string;
    classCode: string;
    sessionDate: string;
    status: "present" | "absent" | "late" | "excused" | "sick";
    sessionStatus: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type StudentDashboardMetrics = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  archivedStudents: number;
  medicalAlerts: number;
};

export type StudentListResult = {
  students: StudentListItem[];
  metrics: StudentDashboardMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type StudentActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
