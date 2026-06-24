import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AttendanceReport,
  CategoryBreakdown,
  EnrolmentReport,
  EventReport,
  FinanceReport,
  ManagementReport,
  ParentStudentReport,
  ReportsDashboardData,
  TrendPoint,
} from "@/features/reports/types";
import { hasAnyPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";

type ManagementKpiRow = {
  active_student_count: number;
  active_parent_count: number;
  active_teacher_count: number;
  active_course_count: number;
  active_class_count: number;
  active_event_count: number;
  attendance_session_count: number;
  total_revenue: number;
  outstanding_balance: number;
  active_event_booking_count: number;
};

type AttendanceSummaryRow = {
  attendance_session_id: string;
  class_id: string;
  class_name: string;
  course_name: string;
  session_date: string;
  session_status: string;
  attendance_record_id: string | null;
  student_id: string | null;
  attendance_status: string | null;
};

type AttendanceStudentRow = {
  student_id: string;
  student_number: string;
  student_name: string;
  attendance_status: string;
};

type InvoiceBalanceRow = {
  invoice_id: string;
  parent_id: string;
  parent_name: string;
  student_id: string;
  student_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
};

type PaymentSummaryRow = {
  payment_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
};

type EnrolmentSummaryRow = {
  enrolment_id: string;
  student_id: string;
  student_number: string;
  student_name: string;
  class_id: string;
  class_name: string;
  course_name: string;
  enrolment_date: string;
  enrolment_status: string;
};

type ClassCapacityRow = {
  class_id: string;
  class_name: string;
  course_name: string;
  capacity: number;
  active_enrolments: number;
  fill_rate: number;
};

type EventBookingSummaryRow = {
  booking_id: string;
  event_id: string;
  event_title: string;
  category: string;
  event_type_name: string;
  start_date: string;
  capacity: number;
  price: number;
  student_id: string;
  student_number: string;
  student_name: string;
  booking_status: string;
  payment_status: string;
};

type EventCapacityRow = {
  event_id: string;
  event_title: string;
  category: string;
  event_type_name: string;
  start_date: string;
  capacity: number;
  active_bookings: number;
  fill_rate: number;
};

async function createReportsSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canViewReports(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["reports.view.all", "reports.export.all", "reports.manage.all"]);
}

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number): string {
  return `${round(value).toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function labelize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function monthLabel(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date);
}

function currentMonthStart(): string {
  const date = new Date();
  date.setDate(1);

  return date.toISOString().slice(0, 10);
}

function addCount(map: Map<string, number>, key: string, amount = 1): void {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function topBreakdown(map: Map<string, number>, limit = 5): CategoryBreakdown[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function trendFromMap(map: Map<string, number>): TrendPoint[] {
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([label, value]) => ({ label, value: round(value) }));
}

async function getManagementReport(supabase: SupabaseClient): Promise<ManagementReport> {
  const { data, error } = await supabase.from("report_management_kpis_view").select("*").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as ManagementKpiRow | null;

  return {
    activeStudentCount: row?.active_student_count ?? 0,
    activeParentCount: row?.active_parent_count ?? 0,
    activeTeacherCount: row?.active_teacher_count ?? 0,
    activeCourseCount: row?.active_course_count ?? 0,
    activeClassCount: row?.active_class_count ?? 0,
    activeEventCount: row?.active_event_count ?? 0,
    attendanceSessionCount: row?.attendance_session_count ?? 0,
    totalRevenue: toNumber(row?.total_revenue),
    outstandingBalance: toNumber(row?.outstanding_balance),
    activeEventBookingCount: row?.active_event_booking_count ?? 0,
  };
}

async function getAttendanceReport(supabase: SupabaseClient): Promise<AttendanceReport> {
  const [{ data: summary, error: summaryError }, { data: studentRows, error: studentError }] = await Promise.all([
    supabase.from("report_attendance_summary_view").select("*").order("session_date", { ascending: true }),
    supabase.from("report_attendance_by_student_view").select("student_id, student_number, student_name, attendance_status"),
  ]);

  if (summaryError) {
    throw new Error(summaryError.message);
  }

  if (studentError) {
    throw new Error(studentError.message);
  }

  const rows = (summary ?? []) as AttendanceSummaryRow[];
  const students = (studentRows ?? []) as AttendanceStudentRow[];
  const sessionIds = new Set(rows.map((row) => row.attendance_session_id));
  const submittedIds = new Set(rows.filter((row) => ["submitted", "reviewed", "locked"].includes(row.session_status)).map((row) => row.attendance_session_id));
  const statusCounts = new Map<string, number>();
  const classCounts = new Map<string, number>();
  const trend = new Map<string, number>();
  const studentAbsences = new Map<string, number>();

  rows.forEach((row) => {
    if (row.attendance_status) {
      addCount(statusCounts, row.attendance_status);
      addCount(classCounts, `${row.course_name} - ${row.class_name}`);
      addCount(trend, monthLabel(row.session_date));
    }
  });

  students.forEach((row) => {
    if (row.attendance_status === "absent" || row.attendance_status === "late" || row.attendance_status === "sick") {
      addCount(studentAbsences, `${row.student_name} (${row.student_number})`);
    }
  });

  const present = statusCounts.get("present") ?? 0;
  const late = statusCounts.get("late") ?? 0;
  const totalMarked = [...statusCounts.values()].reduce((sum, count) => sum + count, 0);

  return {
    totalSessions: sessionIds.size,
    submittedSessions: submittedIds.size,
    presentCount: present,
    absentCount: statusCounts.get("absent") ?? 0,
    lateCount: late,
    excusedCount: statusCounts.get("excused") ?? 0,
    sickCount: statusCounts.get("sick") ?? 0,
    attendanceRate: totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) : 0,
    completionRate: sessionIds.size > 0 ? Math.round((submittedIds.size / sessionIds.size) * 100) : 0,
    trend: trendFromMap(trend),
    byClass: topBreakdown(classCounts),
    byStudent: topBreakdown(studentAbsences),
  };
}

async function getFinanceReport(supabase: SupabaseClient): Promise<FinanceReport> {
  const [{ data: invoices, error: invoiceError }, { data: payments, error: paymentError }] = await Promise.all([
    supabase.from("report_invoice_balances_view").select("*").order("due_date", { ascending: true }),
    supabase.from("report_payment_summary_view").select("*").order("payment_date", { ascending: true }),
  ]);

  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const invoiceRows = (invoices ?? []) as InvoiceBalanceRow[];
  const paymentRows = (payments ?? []) as PaymentSummaryRow[];
  const statusCounts = new Map<string, number>();
  const methodAmounts = new Map<string, number>([
    ["Cash", 0],
    ["Bank Transfer", 0],
    ["Cheque", 0],
  ]);
  const monthlyRevenue = new Map<string, number>();
  const today = new Date().toISOString().slice(0, 10);

  invoiceRows.forEach((invoice) => addCount(statusCounts, labelize(invoice.status)));
  paymentRows.forEach((payment) => {
    const method = labelize(payment.payment_method);
    methodAmounts.set(method, round((methodAmounts.get(method) ?? 0) + toNumber(payment.amount)));
    addCount(monthlyRevenue, monthLabel(payment.payment_date), toNumber(payment.amount));
  });

  return {
    totalInvoiced: round(invoiceRows.reduce((sum, invoice) => sum + toNumber(invoice.total_amount), 0)),
    totalPaid: round(paymentRows.reduce((sum, payment) => sum + toNumber(payment.amount), 0)),
    outstandingBalance: round(invoiceRows.reduce((sum, invoice) => sum + toNumber(invoice.balance_due), 0)),
    overdueBalance: round(invoiceRows.filter((invoice) => invoice.due_date < today && invoice.balance_due > 0).reduce((sum, invoice) => sum + toNumber(invoice.balance_due), 0)),
    invoiceStatus: topBreakdown(statusCounts, 8),
    paymentMethods: [...methodAmounts.entries()].map(([label, value]) => ({ label, value: round(value), helper: "Payment method total" })),
    monthlyRevenue: trendFromMap(monthlyRevenue),
  };
}

async function getEnrolmentReport(supabase: SupabaseClient): Promise<EnrolmentReport> {
  const [{ data: enrolments, error: enrolmentError }, { data: capacity, error: capacityError }] = await Promise.all([
    supabase.from("report_enrolment_summary_view").select("*").order("enrolment_date", { ascending: true }),
    supabase.from("report_class_capacity_view").select("*").order("fill_rate", { ascending: false }),
  ]);

  if (enrolmentError) {
    throw new Error(enrolmentError.message);
  }

  if (capacityError) {
    throw new Error(capacityError.message);
  }

  const rows = (enrolments ?? []) as EnrolmentSummaryRow[];
  const capacityRows = (capacity ?? []) as ClassCapacityRow[];
  const courseCounts = new Map<string, number>();
  const classCounts = new Map<string, number>();
  const monthlyTrend = new Map<string, number>();
  const monthStart = currentMonthStart();

  rows.forEach((row) => {
    addCount(courseCounts, row.course_name);
    addCount(classCounts, row.class_name);
    addCount(monthlyTrend, monthLabel(row.enrolment_date));
  });

  return {
    totalEnrolments: rows.length,
    activeEnrolments: rows.filter((row) => row.enrolment_status === "active").length,
    newThisMonth: rows.filter((row) => row.enrolment_date >= monthStart).length,
    byCourse: topBreakdown(courseCounts),
    byClass: topBreakdown(classCounts),
    capacity: capacityRows.slice(0, 5).map((row) => ({
      label: row.class_name,
      value: round(toNumber(row.fill_rate)),
      helper: `${row.active_enrolments}/${row.capacity} enrolled`,
    })),
    monthlyTrend: trendFromMap(monthlyTrend),
  };
}

async function getEventReport(supabase: SupabaseClient): Promise<EventReport> {
  const [{ data: bookings, error: bookingError }, { data: capacity, error: capacityError }] = await Promise.all([
    supabase.from("report_event_booking_summary_view").select("*").order("start_date", { ascending: true }),
    supabase.from("report_event_capacity_view").select("*").order("fill_rate", { ascending: false }),
  ]);

  if (bookingError) {
    throw new Error(bookingError.message);
  }

  if (capacityError) {
    throw new Error(capacityError.message);
  }

  const bookingRows = (bookings ?? []) as EventBookingSummaryRow[];
  const capacityRows = (capacity ?? []) as EventCapacityRow[];
  const categoryCounts = new Map<string, number>();
  const paymentStatusCounts = new Map<string, number>();
  const bookingTrend = new Map<string, number>();
  const today = new Date().toISOString().slice(0, 10);

  bookingRows.forEach((row) => {
    addCount(categoryCounts, labelize(row.category));
    addCount(paymentStatusCounts, labelize(row.payment_status));
    addCount(bookingTrend, monthLabel(row.start_date));
  });

  return {
    totalEvents: capacityRows.length,
    upcomingEvents: capacityRows.filter((row) => row.start_date >= today).length,
    totalBookings: bookingRows.length,
    nearCapacity: capacityRows.filter((row) => toNumber(row.fill_rate) >= 80).length,
    byCategory: topBreakdown(categoryCounts),
    byPaymentStatus: topBreakdown(paymentStatusCounts),
    capacity: capacityRows.slice(0, 5).map((row) => ({
      label: row.event_title,
      value: round(toNumber(row.fill_rate)),
      helper: `${row.active_bookings}/${row.capacity} booked`,
    })),
    bookingTrend: trendFromMap(bookingTrend),
  };
}

async function getParentStudentReport(supabase: SupabaseClient, management: ManagementReport): Promise<ParentStudentReport> {
  const [{ data: enrolments }, { data: attendance }, { data: invoices }, { data: bookings }] = await Promise.all([
    supabase.from("report_enrolment_summary_view").select("student_id, student_number, student_name, enrolment_status"),
    supabase.from("report_attendance_by_student_view").select("student_id"),
    supabase.from("report_invoice_balances_view").select("invoice_id, student_id"),
    supabase.from("report_event_booking_summary_view").select("booking_id, student_id"),
  ]);

  const enrolmentRows = (enrolments ?? []) as Array<{ student_id: string; student_number: string; student_name: string; enrolment_status: string }>;
  const attendanceRows = (attendance ?? []) as Array<{ student_id: string }>;
  const invoiceRows = (invoices ?? []) as Array<{ invoice_id: string; student_id: string }>;
  const bookingRows = (bookings ?? []) as Array<{ booking_id: string; student_id: string }>;
  const studentMap = new Map<string, ParentStudentReport["roster"][number]>();

  enrolmentRows.forEach((row) => {
    if (!studentMap.has(row.student_id)) {
      studentMap.set(row.student_id, {
        studentNumber: row.student_number,
        studentName: row.student_name,
        activeEnrolments: 0,
        attendanceRecords: 0,
        invoiceCount: 0,
        eventBookings: 0,
      });
    }

    if (row.enrolment_status === "active") {
      studentMap.get(row.student_id)!.activeEnrolments += 1;
    }
  });

  attendanceRows.forEach((row) => {
    const student = studentMap.get(row.student_id);

    if (student) {
      student.attendanceRecords += 1;
    }
  });

  invoiceRows.forEach((row) => {
    const student = studentMap.get(row.student_id);

    if (student) {
      student.invoiceCount += 1;
    }
  });

  bookingRows.forEach((row) => {
    const student = studentMap.get(row.student_id);

    if (student) {
      student.eventBookings += 1;
    }
  });

  const roster = [...studentMap.values()].sort((a, b) => a.studentName.localeCompare(b.studentName)).slice(0, 8);

  return {
    activeStudents: management.activeStudentCount,
    activeParents: management.activeParentCount,
    linkedFamilies: roster.length,
    studentsWithAttendance: new Set(attendanceRows.map((row) => row.student_id)).size,
    studentsWithInvoices: new Set(invoiceRows.map((row) => row.student_id)).size,
    studentsWithEventBookings: new Set(bookingRows.map((row) => row.student_id)).size,
    roster,
  };
}

export async function getReportsDashboardData(profile: UserProfile): Promise<ReportsDashboardData> {
  noStore();

  if (!canViewReports(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createReportsSupabaseClient();
  const [management, attendance, finance, enrolments, events] = await Promise.all([
    getManagementReport(supabase),
    getAttendanceReport(supabase),
    getFinanceReport(supabase),
    getEnrolmentReport(supabase),
    getEventReport(supabase),
  ]);
  const parentStudents = await getParentStudentReport(supabase, management);

  return {
    generatedAt: new Date().toISOString(),
    management,
    attendance,
    finance,
    enrolments,
    events,
    parentStudents,
    dashboardMetrics: [
      { label: "Revenue", value: formatMoney(finance.totalPaid), helper: "Total payments recorded", tone: "navy" },
      { label: "Attendance", value: formatPercent(attendance.attendanceRate), helper: "Present and late over marked records", tone: "sage" },
      { label: "Enrolments", value: enrolments.activeEnrolments.toString(), helper: "Active class enrolments", tone: "gold" },
      { label: "Event bookings", value: events.totalBookings.toString(), helper: "All visible activity bookings", tone: "neutral" },
      { label: "Outstanding", value: formatMoney(finance.outstandingBalance), helper: "Open invoice balance", tone: "gold" },
      { label: "Classes", value: management.activeClassCount.toString(), helper: "Active class groups", tone: "sage" },
    ],
  };
}
