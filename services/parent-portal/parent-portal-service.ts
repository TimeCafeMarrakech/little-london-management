import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ParentPortalAttendanceRecord,
  ParentPortalChild,
  ParentPortalClass,
  ParentPortalDashboard,
  ParentPortalData,
  ParentPortalEventBooking,
  ParentPortalFinance,
  ParentPortalInvoice,
  ParentPortalPayment,
} from "@/features/parent-portal/types";
import { hasAnyPermission } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseAdminClient } from "@/supabase/admin";
import { createSupabaseServerClient } from "@/supabase/server";

type ParentRow = {
  id: string;
  full_name: string;
};

type ParentPortalAccountRow = {
  id: string;
  full_name: string;
  portal_status: "not_invited" | "invited" | "active" | "disabled";
  status: "active" | "inactive" | "archived";
  deleted_at: string | null;
};

type RelationshipRow = {
  id: string;
  student_id: string;
  relationship_type: string;
  is_primary_contact: boolean;
};

type StudentRow = {
  id: string;
  student_number: string;
  full_name: string;
  date_of_birth: string;
  status: string;
  primary_language: string | null;
  school_name: string | null;
};

type EnrolmentRow = {
  id: string;
  student_id: string;
  class_id: string;
  enrolment_date: string;
  status: string;
};

type ClassRow = {
  id: string;
  class_code: string;
  course_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
};

type CourseRow = {
  id: string;
  name: string;
};

type ClassTeacherRow = {
  class_id: string;
  teacher_id: string;
};

type TeacherRow = {
  id: string;
  full_name: string;
};

type AttendanceRecordRow = {
  id: string;
  attendance_session_id: string;
  student_id: string;
  status: string;
  arrival_time: string | null;
};

type AttendanceSessionRow = {
  id: string;
  class_id: string;
  session_date: string;
  status: string;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  student_id: string;
  issue_date: string;
  due_date: string;
  total: number;
  status: string;
};

type PaymentRow = {
  id: string;
  payment_number: string;
  student_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
};

type AllocationRow = {
  payment_id: string;
  invoice_id: string;
  amount_allocated: number;
};

type EventBookingRow = {
  id: string;
  event_id: string;
  student_id: string;
  booking_status: string;
  payment_status: string;
  invoice_id: string | null;
};

type EventRow = {
  id: string;
  event_type_id: string;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  price: number;
};

type EventTypeRow = {
  id: string;
  name: string;
  category: string;
};

async function createParentPortalSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

function canReadParentPortal(profile: UserProfile): boolean {
  return profile.role === "parent" && hasAnyPermission(profile, ["parents.view.own", "students.view.own_child"]);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function byId<TRow extends { id: string }>(rows: TRow[]): Map<string, TRow> {
  return new Map(rows.map((row) => [row.id, row]));
}

async function getParent(profile: UserProfile): Promise<ParentRow | null> {
  return assertParentPortalAccess(profile);
}

export async function assertParentPortalAccess(profile: UserProfile): Promise<ParentRow | null> {
  if (!canReadParentPortal(profile)) {
    throw new Error("forbidden");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("parents")
    .select("id, full_name, portal_status, status, deleted_at")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const parent = data as ParentPortalAccountRow;

  if (parent.deleted_at || parent.status !== "active" || parent.portal_status !== "active") {
    throw new Error("parent_portal_disabled");
  }

  return {
    id: parent.id,
    full_name: parent.full_name,
  };
}

async function getRelationships(parentId: string): Promise<RelationshipRow[]> {
  const supabase = await createParentPortalSupabaseClient();
  const { data, error } = await supabase
    .from("parent_portal_relationships")
    .select("id, student_id, relationship_type, is_primary_contact")
    .eq("parent_id", parentId)
    .order("is_primary_contact", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RelationshipRow[];
}

async function getStudents(studentIds: string[]): Promise<StudentRow[]> {
  if (studentIds.length === 0) {
    return [];
  }

  const supabase = await createParentPortalSupabaseClient();
  const { data, error } = await supabase
    .from("parent_portal_students")
    .select("id, student_number, full_name, date_of_birth, status, primary_language, school_name")
    .in("id", studentIds)
    .order("full_name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StudentRow[];
}

async function getClasses(studentIds: string[], students: Map<string, StudentRow>): Promise<ParentPortalClass[]> {
  if (studentIds.length === 0) {
    return [];
  }

  const supabase = await createParentPortalSupabaseClient();
  const { data: enrolmentData, error: enrolmentError } = await supabase
    .from("parent_portal_enrolments")
    .select("id, student_id, class_id, enrolment_date, status")
    .in("student_id", studentIds)
    .eq("status", "active")
    .order("enrolment_date", { ascending: false });

  if (enrolmentError) {
    throw new Error(enrolmentError.message);
  }

  const enrolments = (enrolmentData ?? []) as EnrolmentRow[];
  const classIds = [...new Set(enrolments.map((enrolment) => enrolment.class_id))];

  if (classIds.length === 0) {
    return [];
  }

  const [{ data: classData, error: classError }, { data: classTeacherData, error: classTeacherError }] = await Promise.all([
    supabase
      .from("parent_portal_classes")
      .select("id, class_code, course_id, name, start_date, end_date")
      .in("id", classIds),
    supabase.from("parent_portal_class_teachers").select("class_id, teacher_id").in("class_id", classIds),
  ]);

  if (classError) {
    throw new Error(classError.message);
  }

  if (classTeacherError) {
    throw new Error(classTeacherError.message);
  }

  const classes = (classData ?? []) as ClassRow[];
  const classMap = byId(classes);
  const courseIds = [...new Set(classes.map((classRow) => classRow.course_id))];
  const teacherRows = (classTeacherData ?? []) as ClassTeacherRow[];
  const teacherIds = [...new Set(teacherRows.map((row) => row.teacher_id))];

  const [{ data: courseData }, { data: teacherData }] = await Promise.all([
    courseIds.length > 0 ? supabase.from("parent_portal_courses").select("id, name").in("id", courseIds) : Promise.resolve({ data: [] }),
    teacherIds.length > 0 ? supabase.from("parent_portal_teachers").select("id, full_name").in("id", teacherIds) : Promise.resolve({ data: [] }),
  ]);

  const courses = byId((courseData ?? []) as CourseRow[]);
  const teachers = byId((teacherData ?? []) as TeacherRow[]);
  const teacherNamesByClass = new Map<string, string[]>();

  teacherRows.forEach((row) => {
    const teacher = teachers.get(row.teacher_id);

    if (!teacher) {
      return;
    }

    teacherNamesByClass.set(row.class_id, [...teacherNamesByClass.get(row.class_id) ?? [], teacher.full_name]);
  });

  return enrolments.flatMap((enrolment) => {
    const classRow = classMap.get(enrolment.class_id);
    const student = students.get(enrolment.student_id);

    if (!classRow || !student) {
      return [];
    }

    return {
      enrolmentId: enrolment.id,
      studentId: enrolment.student_id,
      studentName: student.full_name,
      classId: classRow.id,
      classCode: classRow.class_code,
      className: classRow.name,
      courseName: courses.get(classRow.course_id)?.name ?? "Course",
      enrolmentDate: enrolment.enrolment_date,
      enrolmentStatus: enrolment.status,
      startDate: classRow.start_date,
      endDate: classRow.end_date,
      teachers: teacherNamesByClass.get(classRow.id) ?? [],
    };
  });
}

async function getAttendance(studentIds: string[], students: Map<string, StudentRow>, classes: ParentPortalClass[]): Promise<ParentPortalAttendanceRecord[]> {
  if (studentIds.length === 0) {
    return [];
  }

  const supabase = await createParentPortalSupabaseClient();
  const { data: recordData, error: recordError } = await supabase
    .from("parent_portal_attendance_records")
    .select("id, attendance_session_id, student_id, status, arrival_time")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false })
    .limit(100);

  if (recordError) {
    throw new Error(recordError.message);
  }

  const records = (recordData ?? []) as AttendanceRecordRow[];
  const sessionIds = [...new Set(records.map((record) => record.attendance_session_id))];

  if (sessionIds.length === 0) {
    return [];
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from("parent_portal_attendance_sessions")
    .select("id, class_id, session_date, status")
    .in("id", sessionIds);

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const sessions = byId((sessionData ?? []) as AttendanceSessionRow[]);
  const classById = new Map(classes.map((classItem) => [classItem.classId, classItem]));

  return records.flatMap((record) => {
    const session = sessions.get(record.attendance_session_id);
    const student = students.get(record.student_id);
    const classItem = session ? classById.get(session.class_id) : null;

    if (!session || !student || !classItem) {
      return [];
    }

    return {
      id: record.id,
      studentId: record.student_id,
      studentName: student.full_name,
      className: classItem.className,
      courseName: classItem.courseName,
      sessionDate: session.session_date,
      status: record.status,
      arrivalTime: record.arrival_time,
    };
  });
}

async function getFinance(students: Map<string, StudentRow>): Promise<ParentPortalFinance> {
  const supabase = await createParentPortalSupabaseClient();
  const [{ data: invoiceData, error: invoiceError }, { data: paymentData, error: paymentError }] = await Promise.all([
    supabase
      .from("parent_portal_invoices")
      .select("id, invoice_number, student_id, issue_date, due_date, total, status")
      .order("created_at", { ascending: false }),
    supabase
      .from("parent_portal_payments")
      .select("id, payment_number, student_id, payment_date, amount, payment_method, reference_number")
      .order("payment_date", { ascending: false }),
  ]);

  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const invoiceRows = (invoiceData ?? []) as InvoiceRow[];
  const paymentRows = (paymentData ?? []) as PaymentRow[];
  const invoiceIds = invoiceRows.map((invoice) => invoice.id);
  const paymentIds = paymentRows.map((payment) => payment.id);
  const { data: allocationData } = invoiceIds.length > 0 || paymentIds.length > 0
    ? await supabase
      .from("parent_portal_payment_allocations")
      .select("payment_id, invoice_id, amount_allocated")
      .or([
        invoiceIds.length > 0 ? `invoice_id.in.(${invoiceIds.join(",")})` : "",
        paymentIds.length > 0 ? `payment_id.in.(${paymentIds.join(",")})` : "",
      ].filter(Boolean).join(","))
    : { data: [] };

  const allocations = (allocationData ?? []) as AllocationRow[];
  const paidByInvoice = new Map<string, number>();
  const allocatedByPayment = new Map<string, number>();

  allocations.forEach((allocation) => {
    paidByInvoice.set(allocation.invoice_id, roundMoney((paidByInvoice.get(allocation.invoice_id) ?? 0) + Number(allocation.amount_allocated ?? 0)));
    allocatedByPayment.set(allocation.payment_id, roundMoney((allocatedByPayment.get(allocation.payment_id) ?? 0) + Number(allocation.amount_allocated ?? 0)));
  });

  const invoices: ParentPortalInvoice[] = invoiceRows.map((invoice) => {
    const total = Number(invoice.total ?? 0);
    const amountPaid = paidByInvoice.get(invoice.id) ?? 0;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      studentId: invoice.student_id,
      studentName: students.get(invoice.student_id)?.full_name ?? "Child",
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      total: roundMoney(total),
      amountPaid,
      balanceDue: roundMoney(Math.max(total - amountPaid, 0)),
      status: invoice.status,
    };
  });

  const payments: ParentPortalPayment[] = paymentRows.map((payment) => ({
    id: payment.id,
    paymentNumber: payment.payment_number,
    studentId: payment.student_id,
    studentName: students.get(payment.student_id)?.full_name ?? "Child",
    paymentDate: payment.payment_date,
    amount: roundMoney(Number(payment.amount ?? 0)),
    paymentMethod: payment.payment_method,
    allocatedAmount: allocatedByPayment.get(payment.id) ?? 0,
    referenceNumber: payment.reference_number,
  }));

  return {
    outstandingBalance: roundMoney(invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0)),
    invoiceCount: invoices.length,
    paymentCount: payments.length,
    paidTotal: roundMoney(payments.reduce((sum, payment) => sum + payment.amount, 0)),
    invoices,
    payments,
  };
}

async function getEvents(students: Map<string, StudentRow>): Promise<ParentPortalEventBooking[]> {
  const studentIds = [...students.keys()];

  if (studentIds.length === 0) {
    return [];
  }

  const supabase = await createParentPortalSupabaseClient();
  const { data: bookingData, error: bookingError } = await supabase
    .from("parent_portal_event_bookings")
    .select("id, event_id, student_id, booking_status, payment_status, invoice_id")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false });

  if (bookingError) {
    throw new Error(bookingError.message);
  }

  const bookings = (bookingData ?? []) as EventBookingRow[];
  const eventIds = [...new Set(bookings.map((booking) => booking.event_id))];
  const invoiceIds = [...new Set(bookings.map((booking) => booking.invoice_id).filter((id): id is string => Boolean(id)))];

  if (eventIds.length === 0) {
    return [];
  }

  const [{ data: eventData }, { data: invoiceData }] = await Promise.all([
    supabase
      .from("parent_portal_events")
      .select("id, event_type_id, title, start_date, end_date, start_time, end_time, location, price")
      .in("id", eventIds),
    invoiceIds.length > 0 ? supabase.from("parent_portal_invoices").select("id, invoice_number").in("id", invoiceIds) : Promise.resolve({ data: [] }),
  ]);

  const events = byId((eventData ?? []) as EventRow[]);
  const eventTypeIds = [...new Set([...events.values()].map((event) => event.event_type_id))];
  const { data: eventTypeData } = eventTypeIds.length > 0
    ? await supabase.from("parent_portal_event_types").select("id, name, category").in("id", eventTypeIds)
    : { data: [] };
  const eventTypes = byId((eventTypeData ?? []) as EventTypeRow[]);
  const invoiceNumbers = new Map(((invoiceData ?? []) as Array<{ id: string; invoice_number: string }>).map((invoice) => [invoice.id, invoice.invoice_number]));

  return bookings.flatMap((booking) => {
    const event = events.get(booking.event_id);
    const eventType = event ? eventTypes.get(event.event_type_id) : null;
    const student = students.get(booking.student_id);

    if (!event || !eventType || !student) {
      return [];
    }

    return {
      id: booking.id,
      eventId: event.id,
      studentId: booking.student_id,
      studentName: student.full_name,
      title: event.title,
      category: eventType.category,
      eventTypeName: eventType.name,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      location: event.location,
      price: Number(event.price ?? 0),
      bookingStatus: booking.booking_status,
      paymentStatus: booking.payment_status,
      invoiceId: booking.invoice_id,
      invoiceNumber: booking.invoice_id ? invoiceNumbers.get(booking.invoice_id) ?? null : null,
    };
  });
}

export async function getParentPortalData(profile: UserProfile): Promise<ParentPortalData> {
  noStore();

  const parent = await getParent(profile);

  if (!parent) {
    return emptyParentPortalData();
  }

  const relationships = await getRelationships(parent.id);
  const students = byId(await getStudents(relationships.map((relationship) => relationship.student_id)));
  const studentIds = [...students.keys()];
  const classes = await getClasses(studentIds, students);
  const [attendance, finance, eventBookings] = await Promise.all([
    getAttendance(studentIds, students, classes),
    getFinance(students),
    getEvents(students),
  ]);
  const activeEnrolmentsByStudent = new Map<string, number>();

  classes.forEach((classItem) => {
    if (classItem.enrolmentStatus === "active") {
      activeEnrolmentsByStudent.set(classItem.studentId, (activeEnrolmentsByStudent.get(classItem.studentId) ?? 0) + 1);
    }
  });

  const children: ParentPortalChild[] = relationships.flatMap((relationship) => {
    const student = students.get(relationship.student_id);

    if (!student) {
      return [];
    }

    return {
      id: student.id,
      studentNumber: student.student_number,
      fullName: student.full_name,
      dateOfBirth: student.date_of_birth,
      status: student.status,
      relationshipType: relationship.relationship_type,
      isPrimaryContact: relationship.is_primary_contact,
      primaryLanguage: student.primary_language,
      schoolName: student.school_name,
      activeEnrolmentCount: activeEnrolmentsByStudent.get(student.id) ?? 0,
    };
  });

  const submittedAttendance = attendance.filter((record) => ["present", "absent", "late", "excused", "sick"].includes(record.status));
  const positiveAttendance = submittedAttendance.filter((record) => record.status === "present" || record.status === "late").length;
  const upcomingEvents = eventBookings
    .filter((booking) => booking.startDate >= todayString())
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const dashboard: ParentPortalDashboard = {
    children,
    nextClass: classes.find((classItem) => classItem.enrolmentStatus === "active") ?? null,
    attendanceRate: submittedAttendance.length > 0 ? Math.round((positiveAttendance / submittedAttendance.length) * 100) : 0,
    outstandingBalance: finance.outstandingBalance,
    recentInvoices: finance.invoices.slice(0, 3),
    recentPayments: finance.payments.slice(0, 3),
    upcomingEvents: upcomingEvents.slice(0, 3),
    activeEventBookings: eventBookings.filter((booking) => booking.bookingStatus !== "cancelled").slice(0, 3),
  };

  return {
    ...dashboard,
    classes,
    attendance,
    finance,
    eventBookings,
  };
}

export async function getParentPortalChild(profile: UserProfile, studentId: string): Promise<(ParentPortalData & { child: ParentPortalChild }) | null> {
  const data = await getParentPortalData(profile);
  const child = data.children.find((item) => item.id === studentId);

  if (!child) {
    return null;
  }

  return {
    ...data,
    child,
  };
}

function emptyParentPortalData(): ParentPortalData {
  return {
    children: [],
    nextClass: null,
    attendanceRate: 0,
    outstandingBalance: 0,
    recentInvoices: [],
    recentPayments: [],
    upcomingEvents: [],
    activeEventBookings: [],
    classes: [],
    attendance: [],
    finance: {
      outstandingBalance: 0,
      invoiceCount: 0,
      paymentCount: 0,
      paidTotal: 0,
      invoices: [],
      payments: [],
    },
    eventBookings: [],
  };
}
