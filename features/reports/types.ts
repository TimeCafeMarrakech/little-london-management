export type ReportMetric = {
  label: string;
  value: string;
  helper: string;
  tone: "navy" | "sage" | "gold" | "neutral";
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type CategoryBreakdown = {
  label: string;
  value: number;
  helper?: string;
};

export type AttendanceReport = {
  totalSessions: number;
  submittedSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  sickCount: number;
  attendanceRate: number;
  completionRate: number;
  trend: TrendPoint[];
  byClass: CategoryBreakdown[];
  byStudent: CategoryBreakdown[];
};

export type FinanceReport = {
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueBalance: number;
  invoiceStatus: CategoryBreakdown[];
  paymentMethods: CategoryBreakdown[];
  monthlyRevenue: TrendPoint[];
};

export type EnrolmentReport = {
  totalEnrolments: number;
  activeEnrolments: number;
  newThisMonth: number;
  byCourse: CategoryBreakdown[];
  byClass: CategoryBreakdown[];
  capacity: CategoryBreakdown[];
  monthlyTrend: TrendPoint[];
};

export type EventReport = {
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  nearCapacity: number;
  byCategory: CategoryBreakdown[];
  byPaymentStatus: CategoryBreakdown[];
  capacity: CategoryBreakdown[];
  bookingTrend: TrendPoint[];
};

export type ParentStudentReport = {
  activeStudents: number;
  activeParents: number;
  linkedFamilies: number;
  studentsWithAttendance: number;
  studentsWithInvoices: number;
  studentsWithEventBookings: number;
  roster: Array<{
    studentNumber: string;
    studentName: string;
    activeEnrolments: number;
    attendanceRecords: number;
    invoiceCount: number;
    eventBookings: number;
  }>;
};

export type ManagementReport = {
  activeStudentCount: number;
  activeParentCount: number;
  activeTeacherCount: number;
  activeCourseCount: number;
  activeClassCount: number;
  activeEventCount: number;
  attendanceSessionCount: number;
  totalRevenue: number;
  outstandingBalance: number;
  activeEventBookingCount: number;
};

export type ReportsDashboardData = {
  generatedAt: string;
  management: ManagementReport;
  attendance: AttendanceReport;
  finance: FinanceReport;
  enrolments: EnrolmentReport;
  events: EventReport;
  parentStudents: ParentStudentReport;
  dashboardMetrics: ReportMetric[];
};
