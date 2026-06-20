export type TeacherStatus = "active" | "inactive" | "archived";
export type TeacherEmploymentType = "full_time" | "part_time" | "contractor" | "substitute";

export type TeacherListItem = {
  id: string;
  teacherNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: TeacherStatus;
  employmentType: TeacherEmploymentType;
  hireDate: string | null;
  qualifications: string | null;
  availabilityNotes: string | null;
};

export type TeacherDetail = TeacherListItem & {
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeacherDashboardMetrics = {
  totalTeachers: number;
  activeTeachers: number;
  partTimeTeachers: number;
  archivedTeachers: number;
};

export type TeacherListResult = {
  teachers: TeacherListItem[];
  metrics: TeacherDashboardMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type TeacherActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
