export type AcademicStatus = "active" | "inactive" | "archived";

export type CourseListItem = {
  id: string;
  courseCode: string;
  name: string;
  description: string | null;
  level: string | null;
  minimumAge: number | null;
  maximumAge: number | null;
  status: AcademicStatus;
  classCount: number;
};

export type CourseDetail = CourseListItem & {
  classes: ClassListItem[];
  createdAt: string;
  updatedAt: string;
};

export type ClassListItem = {
  id: string;
  classCode: string;
  courseId: string;
  courseName: string;
  name: string;
  capacity: number;
  status: AcademicStatus;
  startDate: string | null;
  endDate: string | null;
  teacherCount: number;
  enrolmentCount: number;
};

export type AssignedTeacher = {
  assignmentId: string;
  teacherId: string;
  fullName: string;
  teacherNumber: string;
  role: "lead" | "assistant" | "substitute";
};

export type RosterStudent = {
  enrolmentId: string;
  studentId: string;
  studentNumber: string;
  fullName: string;
  status: "active" | "inactive" | "archived";
  enrolmentDate: string;
  enrolmentStatus: "active" | "completed" | "withdrawn" | "archived";
};

export type SelectOption = {
  id: string;
  label: string;
  helper?: string;
};

export type ClassDetail = ClassListItem & {
  teachers: AssignedTeacher[];
  roster: RosterStudent[];
  availableTeachers: SelectOption[];
  availableStudents: SelectOption[];
  createdAt: string;
  updatedAt: string;
};

export type AcademicDashboardMetrics = {
  totalCourses: number;
  activeCourses: number;
  totalClasses: number;
  activeClasses: number;
  classesNearCapacity: number;
  totalEnrolments: number;
  activeEnrolments: number;
};

export type AcademicListResult<TItem> = {
  items: TItem[];
  metrics: AcademicDashboardMetrics;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type AcademicActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
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
