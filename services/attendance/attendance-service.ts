import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AttendanceCorrectionInput,
  AttendanceListQuery,
  AttendanceRecordsUpdateInput,
  CreateAttendanceSessionInput,
} from "@/features/attendance/schemas";
import type {
  AttendanceClassOption,
  AttendanceCorrectionItem,
  AttendanceHistoryItem,
  AttendanceListResult,
  AttendanceMetrics,
  AttendanceRecordItem,
  AttendanceSessionDetail,
  AttendanceSessionListItem,
  AttendanceSessionStatus,
  AttendanceStatus,
} from "@/features/attendance/types";
import { hasAnyPermission, hasPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";

type Relation<TRow> = TRow | TRow[] | null;

type ClassRelation = {
  id: string;
  class_code: string;
  name: string;
  courses: Relation<{ name: string }>;
};

type AttendanceSessionRow = {
  id: string;
  class_id: string;
  session_date: string;
  status: AttendanceSessionStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
  classes: Relation<ClassRelation>;
};

type AttendanceRecordRow = {
  id: string;
  attendance_session_id: string;
  student_id: string;
  student_enrolment_id: string;
  status: AttendanceStatus;
  arrival_time: string | null;
  notes: string | null;
  students: Relation<{
    student_number: string;
    full_name: string;
  }>;
};

type AttendanceCorrectionRow = {
  id: string;
  attendance_record_id: string;
  previous_status: AttendanceStatus;
  new_status: AttendanceStatus;
  correction_reason: string;
  corrected_at: string;
};

type CountRow = {
  attendance_session_id: string;
  status: AttendanceStatus;
};

type EnrolmentRow = {
  id: string;
  student_id: string;
  students: Relation<{
    student_number: string;
    full_name: string;
  }>;
};

async function createAttendanceSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

function firstRelation<TRow>(relation: Relation<TRow>): TRow | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isSameDay(date: string): boolean {
  return date === todayString();
}

export function canManageAttendance(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["attendance.manage.all", "attendance.approve.all"]);
}

export function canReadAttendance(profile: UserProfile): boolean {
  return canManageAttendance(profile) || hasRole(profile, ["teacher"]) && hasPermission(profile, "attendance.view.assigned_classes");
}

export function canCreateAttendance(profile: UserProfile): boolean {
  return canManageAttendance(profile) || hasRole(profile, ["teacher"]) && hasPermission(profile, "attendance.create.assigned_classes");
}

function canEditTeacherAttendance(profile: UserProfile): boolean {
  return hasRole(profile, ["teacher"]) && hasPermission(profile, "attendance.edit.assigned_classes_same_day");
}

async function getTeacherProfileId(profile: UserProfile): Promise<string | null> {
  if (profile.role !== "teacher") {
    return null;
  }

  const supabase = await createAttendanceSupabaseClient();
  const { data } = await supabase.from("teachers").select("id").eq("user_id", profile.id).is("deleted_at", null).maybeSingle();

  return data?.id ?? null;
}

async function getAssignedClassIds(profile: UserProfile): Promise<string[]> {
  const teacherId = await getTeacherProfileId(profile);

  if (!teacherId) {
    return [];
  }

  const supabase = await createAttendanceSupabaseClient();
  const { data } = await supabase.from("class_teachers").select("class_id").eq("teacher_id", teacherId).is("deleted_at", null);

  return ((data ?? []) as Array<{ class_id: string }>).map((row) => row.class_id);
}

async function canAccessClass(profile: UserProfile, classId: string): Promise<boolean> {
  if (canManageAttendance(profile)) {
    return true;
  }

  const assignedClassIds = await getAssignedClassIds(profile);

  return assignedClassIds.includes(classId);
}

function toSessionListItem(row: AttendanceSessionRow, counts: Map<string, Record<AttendanceStatus, number>>): AttendanceSessionListItem {
  const classRow = firstRelation(row.classes);
  const course = firstRelation(classRow?.courses ?? null);
  const sessionCounts = counts.get(row.id) ?? { present: 0, absent: 0, late: 0, excused: 0, sick: 0 };

  return {
    id: row.id,
    classId: row.class_id,
    classCode: classRow?.class_code ?? "",
    className: classRow?.name ?? "Class not found",
    courseName: course?.name ?? "Course not found",
    sessionDate: row.session_date,
    status: row.status,
    recordCount: Object.values(sessionCounts).reduce((total, count) => total + count, 0),
    presentCount: sessionCounts.present,
    absentCount: sessionCounts.absent,
    lateCount: sessionCounts.late,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    lockedAt: row.locked_at,
  };
}

async function getRecordCounts(sessionIds: string[]): Promise<Map<string, Record<AttendanceStatus, number>>> {
  const counts = new Map<string, Record<AttendanceStatus, number>>();

  if (sessionIds.length === 0) {
    return counts;
  }

  const supabase = await createAttendanceSupabaseClient();
  const { data } = await supabase
    .from("attendance_records")
    .select("attendance_session_id, status")
    .in("attendance_session_id", sessionIds)
    .is("deleted_at", null);

  ((data ?? []) as CountRow[]).forEach((row) => {
    const current = counts.get(row.attendance_session_id) ?? { present: 0, absent: 0, late: 0, excused: 0, sick: 0 };
    current[row.status] += 1;
    counts.set(row.attendance_session_id, current);
  });

  return counts;
}

export async function listAttendanceSessions(profile: UserProfile, filters: AttendanceListQuery): Promise<AttendanceListResult> {
  noStore();

  if (!canReadAttendance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  let query = supabase
    .from("attendance_sessions")
    .select("id, class_id, session_date, status, submitted_at, reviewed_at, locked_at, created_at, updated_at, classes(id, class_code, name, courses(name))", { count: "exact" });

  if (!canManageAttendance(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);

    if (assignedClassIds.length === 0) {
      return { sessions: [], metrics: await getAttendanceMetrics(profile), totalRecords: 0, totalPages: 0, page: filters.page, pageSize: filters.pageSize };
    }

    query = query.in("class_id", assignedClassIds).is("deleted_at", null);
  } else if (filters.status !== "archived") {
    query = query.is("deleted_at", null);
  }

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.classId) {
    query = query.eq("class_id", filters.classId);
  }

  if (filters.dateFrom) {
    query = query.gte("session_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("session_date", filters.dateTo);
  }

  if (filters.query) {
    query = query.or(`status.ilike.%${filters.query}%`);
  }

  const sort = filters.sort === "status" || filters.sort === "created_at" || filters.sort === "updated_at" ? filters.sort : "session_date";
  const { data, error, count } = await query.order(sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as AttendanceSessionRow[];
  const counts = await getRecordCounts(rows.map((row) => row.id));

  return {
    sessions: rows.map((row) => toSessionListItem(row, counts)),
    metrics: await getAttendanceMetrics(profile),
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getAttendanceMetrics(profile: UserProfile): Promise<AttendanceMetrics> {
  if (!canReadAttendance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  let sessionQuery = supabase.from("attendance_sessions").select("id, status", { count: "exact" }).eq("session_date", todayString()).is("deleted_at", null);
  let recordQuery = supabase.from("attendance_records").select("status, attendance_sessions!inner(session_date, class_id)", { count: "exact" }).eq("attendance_sessions.session_date", todayString()).is("deleted_at", null);

  if (!canManageAttendance(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);

    if (assignedClassIds.length === 0) {
      return { todaysSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, pendingSessions: 0, completionRate: 0 };
    }

    sessionQuery = sessionQuery.in("class_id", assignedClassIds);
    recordQuery = recordQuery.in("attendance_sessions.class_id", assignedClassIds);
  }

  const [{ data: sessions, count: todaysSessions }, { data: records }] = await Promise.all([sessionQuery, recordQuery]);
  const sessionRows = (sessions ?? []) as Array<{ status: AttendanceSessionStatus }>;
  const recordRows = (records ?? []) as Array<{ status: AttendanceStatus }>;
  const presentCount = recordRows.filter((record) => record.status === "present").length;
  const absentCount = recordRows.filter((record) => record.status === "absent").length;
  const lateCount = recordRows.filter((record) => record.status === "late").length;
  const completedSessions = sessionRows.filter((session) => session.status === "submitted" || session.status === "reviewed" || session.status === "locked").length;
  const pendingSessions = sessionRows.filter((session) => session.status === "draft").length;

  return {
    todaysSessions: todaysSessions ?? 0,
    presentCount,
    absentCount,
    lateCount,
    pendingSessions,
    completionRate: sessionRows.length > 0 ? Math.round((completedSessions / sessionRows.length) * 100) : 0,
  };
}

export async function listAttendanceClassOptions(profile: UserProfile): Promise<AttendanceClassOption[]> {
  if (!canReadAttendance(profile) && !canCreateAttendance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  let query = supabase
    .from("classes")
    .select("id, class_code, name, courses(name)")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name");

  if (!canManageAttendance(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);

    if (assignedClassIds.length === 0) {
      return [];
    }

    query = query.in("id", assignedClassIds);
  }

  const { data } = await query.limit(200);

  return ((data ?? []) as unknown as Array<{ id: string; class_code: string; name: string; courses: Relation<{ name: string }> }>).map((row) => {
    const course = firstRelation(row.courses);

    return {
      id: row.id,
      label: row.name,
      helper: `${row.class_code} - ${course?.name ?? "Course not found"}`,
    };
  });
}

export async function createAttendanceSession(profile: UserProfile, input: CreateAttendanceSessionInput): Promise<string> {
  if (!canCreateAttendance(profile) || !await canAccessClass(profile, input.classId)) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  const { data: enrolments, error: enrolmentError } = await supabase
    .from("student_enrolments")
    .select("id, student_id, students(student_number, full_name)")
    .eq("class_id", input.classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("enrolment_date", { ascending: true });

  if (enrolmentError) {
    throw new Error(enrolmentError.message);
  }

  const roster = (enrolments ?? []) as unknown as EnrolmentRow[];

  if (roster.length === 0) {
    throw new Error("empty_roster");
  }

  const { data: session, error: sessionError } = await supabase
    .from("attendance_sessions")
    .insert({
      class_id: input.classId,
      session_date: input.sessionDate,
      status: "draft",
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const { error: recordsError } = await supabase.from("attendance_records").insert(
    roster.map((row) => ({
      attendance_session_id: session.id,
      student_id: row.student_id,
      student_enrolment_id: row.id,
      status: "present",
      created_by: profile.id,
      updated_by: profile.id,
    })),
  );

  if (recordsError) {
    await supabase
      .from("attendance_sessions")
      .delete()
      .eq("id", session.id)
      .eq("status", "draft")
      .is("submitted_at", null)
      .is("reviewed_at", null)
      .is("locked_at", null);

    throw new Error(recordsError.message);
  }

  return session.id;
}

export async function getAttendanceSessionDetail(profile: UserProfile, attendanceSessionId: string): Promise<AttendanceSessionDetail | null> {
  noStore();

  if (!canReadAttendance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id, class_id, session_date, status, submitted_at, reviewed_at, locked_at, created_at, updated_at, classes(id, class_code, name, courses(name))")
    .eq("id", attendanceSessionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as AttendanceSessionRow;

  if (!await canAccessClass(profile, row.class_id)) {
    return null;
  }

  const [counts, records, corrections] = await Promise.all([
    getRecordCounts([attendanceSessionId]),
    getAttendanceRecords(attendanceSessionId),
    getAttendanceCorrections(attendanceSessionId),
  ]);
  const item = toSessionListItem(row, counts);
  const unlocked = !row.locked_at && row.status !== "locked" && row.status !== "archived";
  const teacherEditable = canEditTeacherAttendance(profile) && isSameDay(row.session_date) && unlocked && row.status !== "reviewed";
  const management = canManageAttendance(profile);

  return {
    ...item,
    records,
    corrections,
    canEdit: management && unlocked || teacherEditable,
    canSubmit: (management || teacherEditable) && unlocked && row.status === "draft",
    canReview: management && unlocked && row.status === "submitted",
    canLock: management && unlocked && (row.status === "submitted" || row.status === "reviewed"),
    canCorrect: management,
  };
}

async function getAttendanceRecords(attendanceSessionId: string): Promise<AttendanceRecordItem[]> {
  const supabase = await createAttendanceSupabaseClient();
  const { data } = await supabase
    .from("attendance_records")
    .select("id, attendance_session_id, student_id, student_enrolment_id, status, arrival_time, notes, students(student_number, full_name)")
    .eq("attendance_session_id", attendanceSessionId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return ((data ?? []) as unknown as AttendanceRecordRow[]).flatMap((row) => {
    const student = firstRelation(row.students);

    if (!student) {
      return [];
    }

    return {
      id: row.id,
      studentId: row.student_id,
      studentNumber: student.student_number,
      studentName: student.full_name,
      studentEnrolmentId: row.student_enrolment_id,
      status: row.status,
      arrivalTime: row.arrival_time,
      notes: row.notes,
    };
  });
}

async function getAttendanceCorrections(attendanceSessionId: string): Promise<AttendanceCorrectionItem[]> {
  const supabase = await createAttendanceSupabaseClient();
  const { data } = await supabase
    .from("attendance_corrections")
    .select("id, attendance_record_id, previous_status, new_status, correction_reason, corrected_at, attendance_records!inner(attendance_session_id)")
    .eq("attendance_records.attendance_session_id", attendanceSessionId)
    .order("corrected_at", { ascending: false });

  return ((data ?? []) as unknown as AttendanceCorrectionRow[]).map((row) => ({
    id: row.id,
    attendanceRecordId: row.attendance_record_id,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    correctionReason: row.correction_reason,
    correctedAt: row.corrected_at,
  }));
}

export async function updateAttendanceRecords(profile: UserProfile, input: AttendanceRecordsUpdateInput): Promise<void> {
  const detail = await getAttendanceSessionDetail(profile, input.attendanceSessionId);

  if (!detail || !detail.canEdit) {
    throw new Error("forbidden");
  }

  const allowedRecordIds = new Set(detail.records.map((record) => record.id));
  const supabase = await createAttendanceSupabaseClient();

  for (const record of input.records) {
    if (!allowedRecordIds.has(record.id)) {
      throw new Error("forbidden");
    }

    const { error } = await supabase
      .from("attendance_records")
      .update({
        status: record.status,
        arrival_time: record.arrivalTime,
        notes: record.notes,
        updated_by: profile.id,
      })
      .eq("id", record.id)
      .eq("attendance_session_id", input.attendanceSessionId)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function submitAttendanceSession(profile: UserProfile, attendanceSessionId: string): Promise<void> {
  const detail = await getAttendanceSessionDetail(profile, attendanceSessionId);

  if (!detail || !detail.canSubmit) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  const { error } = await supabase
    .from("attendance_sessions")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      submitted_by: profile.id,
    })
    .eq("id", attendanceSessionId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function reviewAttendanceSession(profile: UserProfile, attendanceSessionId: string): Promise<void> {
  const detail = await getAttendanceSessionDetail(profile, attendanceSessionId);

  if (!detail || !detail.canReview) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  const { error } = await supabase
    .from("attendance_sessions")
    .update({
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: profile.id,
    })
    .eq("id", attendanceSessionId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function lockAttendanceSession(profile: UserProfile, attendanceSessionId: string): Promise<void> {
  const detail = await getAttendanceSessionDetail(profile, attendanceSessionId);

  if (!detail || !detail.canLock) {
    throw new Error("forbidden");
  }

  const supabase = await createAttendanceSupabaseClient();
  const { error } = await supabase
    .from("attendance_sessions")
    .update({
      status: "locked",
      locked_at: new Date().toISOString(),
      locked_by: profile.id,
    })
    .eq("id", attendanceSessionId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function correctAttendanceRecord(profile: UserProfile, input: AttendanceCorrectionInput): Promise<void> {
  const detail = await getAttendanceSessionDetail(profile, input.attendanceSessionId);

  if (!detail || !detail.canCorrect) {
    throw new Error("forbidden");
  }

  const record = detail.records.find((item) => item.id === input.attendanceRecordId);

  if (!record) {
    throw new Error("not_found");
  }

  if (record.status === input.newStatus) {
    throw new Error("same_status");
  }

  const supabase = await createAttendanceSupabaseClient();
  const { error: updateError } = await supabase
    .from("attendance_records")
    .update({
      status: input.newStatus,
      updated_by: profile.id,
    })
    .eq("id", input.attendanceRecordId)
    .eq("attendance_session_id", input.attendanceSessionId)
    .is("deleted_at", null);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: correctionError } = await supabase.from("attendance_corrections").insert({
    attendance_record_id: input.attendanceRecordId,
    previous_status: record.status,
    new_status: input.newStatus,
    correction_reason: input.correctionReason,
    corrected_by: profile.id,
  });

  if (correctionError) {
    throw new Error(correctionError.message);
  }
}

export async function getClassAttendanceHistory(profile: UserProfile, classId: string): Promise<AttendanceSessionListItem[]> {
  if (!canReadAttendance(profile) || !await canAccessClass(profile, classId)) {
    return [];
  }

  const supabase = await createAttendanceSupabaseClient();
  const { data } = await supabase
    .from("attendance_sessions")
    .select("id, class_id, session_date, status, submitted_at, reviewed_at, locked_at, created_at, updated_at, classes(id, class_code, name, courses(name))")
    .eq("class_id", classId)
    .is("deleted_at", null)
    .order("session_date", { ascending: false })
    .limit(6);
  const rows = (data ?? []) as unknown as AttendanceSessionRow[];
  const counts = await getRecordCounts(rows.map((row) => row.id));

  return rows.map((row) => toSessionListItem(row, counts));
}

export async function getStudentAttendanceHistory(profile: UserProfile, studentId: string): Promise<AttendanceHistoryItem[]> {
  if (!canManageAttendance(profile)) {
    return [];
  }

  const supabase = await createAttendanceSupabaseClient();
  const { data } = await supabase
    .from("attendance_records")
    .select("id, status, attendance_sessions(id, class_id, session_date, status, classes(class_code, name))")
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  return ((data ?? []) as unknown as Array<{
    id: string;
    status: AttendanceStatus;
    attendance_sessions: Relation<{
      id: string;
      class_id: string;
      session_date: string;
      status: AttendanceSessionStatus;
      classes: Relation<{ class_code: string; name: string }>;
    }>;
  }>).flatMap((row) => {
    const session = firstRelation(row.attendance_sessions);
    const classRow = firstRelation(session?.classes ?? null);

    if (!session || !classRow) {
      return [];
    }

    return {
      id: row.id,
      classId: session.class_id,
      className: classRow.name,
      classCode: classRow.class_code,
      sessionDate: session.session_date,
      status: row.status,
      sessionStatus: session.status,
    };
  });
}
