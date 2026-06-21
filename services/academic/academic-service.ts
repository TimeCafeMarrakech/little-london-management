import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AcademicListQuery,
  ClassFormInput,
  ClassStatusInput,
  CourseFormInput,
  CourseStatusInput,
  StudentEnrolmentInput,
  StudentEnrolmentRemoveInput,
  TeacherAssignmentInput,
  TeacherAssignmentRemoveInput,
} from "@/features/academic/schemas";
import type {
  AcademicDashboardMetrics,
  AcademicListResult,
  AssignedTeacher,
  ClassDetail,
  ClassListItem,
  CourseDetail,
  CourseListItem,
  RosterStudent,
  SelectOption,
  StudentEnrolmentSummary,
} from "@/features/academic/types";
import { hasAnyPermission, hasPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { getClassAttendanceHistory } from "@/services/attendance/attendance-service";
import { createSupabaseServerClient } from "@/supabase/server";

type CourseRow = {
  id: string;
  course_code: string;
  name: string;
  description: string | null;
  level: string | null;
  minimum_age: number | null;
  maximum_age: number | null;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
};

type ClassRow = {
  id: string;
  class_code: string;
  course_id: string;
  name: string;
  capacity: number;
  status: "active" | "inactive" | "archived";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  courses?: { name: string } | Array<{ name: string }> | null;
};

type CountRow = {
  class_id: string;
};

async function createAcademicSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canManageAcademic(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["courses.manage.all", "classes.manage.all", "enrolments.manage.all"]);
}

export function canManageCourses(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasPermission(profile, "courses.manage.all");
}

export function canManageClasses(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasPermission(profile, "classes.manage.all");
}

export function canManageEnrolments(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasPermission(profile, "enrolments.manage.all");
}

export function canReadAcademic(profile: UserProfile): boolean {
  return canManageAcademic(profile) || hasRole(profile, ["teacher"]);
}

function toCourseListItem(row: CourseRow, classCounts: Map<string, number>): CourseListItem {
  return {
    id: row.id,
    courseCode: row.course_code,
    name: row.name,
    description: row.description,
    level: row.level,
    minimumAge: row.minimum_age,
    maximumAge: row.maximum_age,
    status: row.status,
    classCount: classCounts.get(row.id) ?? 0,
  };
}

function toClassListItem(row: ClassRow, teacherCounts: Map<string, number>, enrolmentCounts: Map<string, number>): ClassListItem {
  const course = firstRelation(row.courses);

  return {
    id: row.id,
    classCode: row.class_code,
    courseId: row.course_id,
    courseName: course?.name ?? "Course not found",
    name: row.name,
    capacity: row.capacity,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    teacherCount: teacherCounts.get(row.id) ?? 0,
    enrolmentCount: enrolmentCounts.get(row.id) ?? 0,
  };
}

function buildCountMap(rows: CountRow[] | null): Map<string, number> {
  const counts = new Map<string, number>();

  (rows ?? []).forEach((row) => {
    counts.set(row.class_id, (counts.get(row.class_id) ?? 0) + 1);
  });

  return counts;
}

function firstRelation<TRow>(relation: TRow | TRow[] | null | undefined): TRow | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

async function getTeacherProfileId(profile: UserProfile): Promise<string | null> {
  if (profile.role !== "teacher") {
    return null;
  }

  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase.from("teachers").select("id").eq("user_id", profile.id).is("deleted_at", null).maybeSingle();

  return data?.id ?? null;
}

async function getAssignedClassIds(profile: UserProfile): Promise<string[]> {
  const teacherId = await getTeacherProfileId(profile);

  if (!teacherId) {
    return [];
  }

  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase.from("class_teachers").select("class_id").eq("teacher_id", teacherId).is("deleted_at", null);

  return ((data ?? []) as CountRow[]).map((row) => row.class_id);
}

export async function listCourses(profile: UserProfile, filters: AcademicListQuery): Promise<AcademicListResult<CourseListItem>> {
  noStore();

  if (!canReadAcademic(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  let query = supabase
    .from("courses")
    .select("id, course_code, name, description, level, minimum_age, maximum_age, status, created_at, updated_at", { count: "exact" });

  if (!canManageAcademic(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);

    if (assignedClassIds.length === 0) {
      return { items: [], metrics: await getAcademicMetrics(profile), totalRecords: 0, totalPages: 0, page: filters.page, pageSize: filters.pageSize };
    }

    const { data: classCourses } = await supabase.from("classes").select("course_id").in("id", assignedClassIds).is("deleted_at", null);
    const courseIds = [...new Set(((classCourses ?? []) as Array<{ course_id: string }>).map((row) => row.course_id))];

    if (courseIds.length === 0) {
      return { items: [], metrics: await getAcademicMetrics(profile), totalRecords: 0, totalPages: 0, page: filters.page, pageSize: filters.pageSize };
    }

    query = query.in("id", courseIds).is("deleted_at", null);
  }

  if (filters.status === "archived") {
    query = query.eq("status", "archived");
  } else {
    query = query.is("deleted_at", null);

    if (filters.status !== "all") {
      query = query.eq("status", filters.status);
    } else {
      query = query.neq("status", "archived");
    }
  }

  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,course_code.ilike.%${filters.query}%,level.ilike.%${filters.query}%`);
  }

  const sort = filters.sort === "course_code" || filters.sort === "name" || filters.sort === "status" || filters.sort === "created_at" || filters.sort === "updated_at"
    ? filters.sort
    : "created_at";
  const { data, error, count } = await query.order(sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CourseRow[];
  const classCounts = await getCourseClassCounts(rows.map((row) => row.id));

  return {
    items: rows.map((row) => toCourseListItem(row, classCounts)),
    metrics: await getAcademicMetrics(profile),
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

async function getCourseClassCounts(courseIds: string[]): Promise<Map<string, number>> {
  if (courseIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase.from("classes").select("course_id").in("course_id", courseIds).is("deleted_at", null);
  const counts = new Map<string, number>();

  ((data ?? []) as Array<{ course_id: string }>).forEach((row) => {
    counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1);
  });

  return counts;
}

export async function listClasses(profile: UserProfile, filters: AcademicListQuery): Promise<AcademicListResult<ClassListItem>> {
  noStore();

  if (!canReadAcademic(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  let query = supabase
    .from("classes")
    .select("id, class_code, course_id, name, capacity, status, start_date, end_date, created_at, updated_at, courses(name)", { count: "exact" });

  if (!canManageAcademic(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);

    if (assignedClassIds.length === 0) {
      return { items: [], metrics: await getAcademicMetrics(profile), totalRecords: 0, totalPages: 0, page: filters.page, pageSize: filters.pageSize };
    }

    query = query.in("id", assignedClassIds).is("deleted_at", null);
  }

  if (filters.status === "archived") {
    query = query.eq("status", "archived");
  } else {
    query = query.is("deleted_at", null);

    if (filters.status !== "all") {
      query = query.eq("status", filters.status);
    } else {
      query = query.neq("status", "archived");
    }
  }

  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,class_code.ilike.%${filters.query}%`);
  }

  const sort = filters.sort === "class_code" || filters.sort === "name" || filters.sort === "status" || filters.sort === "created_at" || filters.sort === "updated_at" || filters.sort === "start_date"
    ? filters.sort
    : "created_at";
  const { data, error, count } = await query.order(sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ClassRow[];
  const classIds = rows.map((row) => row.id);
  const [teacherCounts, enrolmentCounts] = await Promise.all([getClassTeacherCounts(classIds), getClassEnrolmentCounts(classIds)]);

  return {
    items: rows.map((row) => toClassListItem(row, teacherCounts, enrolmentCounts)),
    metrics: await getAcademicMetrics(profile),
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

async function getClassTeacherCounts(classIds: string[]): Promise<Map<string, number>> {
  if (classIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase.from("class_teachers").select("class_id").in("class_id", classIds).is("deleted_at", null);

  return buildCountMap((data ?? []) as CountRow[]);
}

async function getClassEnrolmentCounts(classIds: string[]): Promise<Map<string, number>> {
  if (classIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase.from("student_enrolments").select("class_id").in("class_id", classIds).eq("status", "active").is("deleted_at", null);

  return buildCountMap((data ?? []) as CountRow[]);
}

export async function getAcademicMetrics(profile: UserProfile): Promise<AcademicDashboardMetrics> {
  if (!canReadAcademic(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();

  if (!canManageAcademic(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);
    const assignedClassCount = assignedClassIds.length;
    let activeEnrolments = 0;

    if (assignedClassIds.length > 0) {
      const { count } = await supabase
        .from("student_enrolments")
        .select("id", { count: "exact", head: true })
        .in("class_id", assignedClassIds)
        .eq("status", "active")
        .is("deleted_at", null);
      activeEnrolments = count ?? 0;
    }

    return {
      totalCourses: 0,
      activeCourses: 0,
      totalClasses: assignedClassCount,
      activeClasses: assignedClassCount,
      classesNearCapacity: 0,
      totalEnrolments: activeEnrolments,
      activeEnrolments,
    };
  }

  const [totalCourses, activeCourses, totalClasses, activeClasses, totalEnrolments, activeEnrolments] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("classes").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("classes").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("student_enrolments").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("student_enrolments").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
  ]);
  const nearCapacity = await getClassesNearCapacityCount();

  return {
    totalCourses: totalCourses.count ?? 0,
    activeCourses: activeCourses.count ?? 0,
    totalClasses: totalClasses.count ?? 0,
    activeClasses: activeClasses.count ?? 0,
    classesNearCapacity: nearCapacity,
    totalEnrolments: totalEnrolments.count ?? 0,
    activeEnrolments: activeEnrolments.count ?? 0,
  };
}

async function getClassesNearCapacityCount(): Promise<number> {
  const supabase = await createAcademicSupabaseClient();
  const { data: classes } = await supabase.from("classes").select("id, capacity").eq("status", "active").is("deleted_at", null);
  const rows = (classes ?? []) as Array<{ id: string; capacity: number }>;

  if (rows.length === 0) {
    return 0;
  }

  const enrolmentCounts = await getClassEnrolmentCounts(rows.map((row) => row.id));

  return rows.filter((row) => (enrolmentCounts.get(row.id) ?? 0) >= Math.ceil(row.capacity * 0.8)).length;
}

export async function getCourseDetail(profile: UserProfile, courseId: string): Promise<CourseDetail | null> {
  noStore();

  if (!canReadAcademic(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, course_code, name, description, level, minimum_age, maximum_age, status, created_at, updated_at")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const classes = await getClassesForCourse(profile, courseId);
  const row = data as CourseRow;

  if (!canManageAcademic(profile) && classes.length === 0) {
    return null;
  }

  return {
    ...toCourseListItem(row, new Map([[courseId, classes.length]])),
    classes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getClassesForCourse(profile: UserProfile, courseId: string): Promise<ClassListItem[]> {
  const supabase = await createAcademicSupabaseClient();
  let query = supabase
    .from("classes")
    .select("id, class_code, course_id, name, capacity, status, start_date, end_date, created_at, updated_at, courses(name)")
    .eq("course_id", courseId)
    .is("deleted_at", null);

  if (!canManageAcademic(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);

    if (assignedClassIds.length === 0) {
      return [];
    }

    query = query.in("id", assignedClassIds);
  }

  const { data } = await query.order("start_date", { ascending: true });
  const rows = (data ?? []) as ClassRow[];
  const classIds = rows.map((row) => row.id);
  const [teacherCounts, enrolmentCounts] = await Promise.all([getClassTeacherCounts(classIds), getClassEnrolmentCounts(classIds)]);

  return rows.map((row) => toClassListItem(row, teacherCounts, enrolmentCounts));
}

export async function getClassDetail(profile: UserProfile, classId: string): Promise<ClassDetail | null> {
  noStore();

  if (!canReadAcademic(profile)) {
    throw new Error("forbidden");
  }

  if (!canManageAcademic(profile)) {
    const assignedClassIds = await getAssignedClassIds(profile);

    if (!assignedClassIds.includes(classId)) {
      return null;
    }
  }

  const supabase = await createAcademicSupabaseClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, class_code, course_id, name, capacity, status, start_date, end_date, created_at, updated_at, courses(name)")
    .eq("id", classId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as ClassRow;
  const [teacherCounts, enrolmentCounts, teachers, roster, availableTeachers, availableStudents, attendanceSessions] = await Promise.all([
    getClassTeacherCounts([classId]),
    getClassEnrolmentCounts([classId]),
    getAssignedTeachers(classId),
    getClassRoster(classId),
    getAvailableTeachers(classId),
    getAvailableStudents(classId),
    getClassAttendanceHistory(profile, classId),
  ]);

  return {
    ...toClassListItem(row, teacherCounts, enrolmentCounts),
    teachers,
    roster,
    availableTeachers,
    availableStudents,
    attendanceSessions: attendanceSessions.map((session) => ({
      id: session.id,
      sessionDate: session.sessionDate,
      status: session.status,
      presentCount: session.presentCount,
      absentCount: session.absentCount,
      lateCount: session.lateCount,
      recordCount: session.recordCount,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAssignedTeachers(classId: string): Promise<AssignedTeacher[]> {
  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase
    .from("class_teachers")
    .select("id, teacher_id, role, teachers(id, teacher_number, full_name)")
    .eq("class_id", classId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return ((data ?? []) as unknown as Array<{
    id: string;
    teacher_id: string;
    role: "lead" | "assistant" | "substitute";
    teachers: { teacher_number: string; full_name: string } | Array<{ teacher_number: string; full_name: string }> | null;
  }>).map((row) => {
    const teacher = firstRelation(row.teachers);

    return {
      assignmentId: row.id,
      teacherId: row.teacher_id,
      fullName: teacher?.full_name ?? "Teacher not found",
      teacherNumber: teacher?.teacher_number ?? "",
      role: row.role,
    };
  });
}

async function getClassRoster(classId: string): Promise<RosterStudent[]> {
  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase
    .from("student_enrolments")
    .select("id, student_id, enrolment_date, status, students(id, student_number, full_name, status)")
    .eq("class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("enrolment_date", { ascending: true });

  return ((data ?? []) as unknown as Array<{
    id: string;
    student_id: string;
    enrolment_date: string;
    status: "active" | "completed" | "withdrawn" | "archived";
    students: { student_number: string; full_name: string; status: "active" | "inactive" | "archived" } | Array<{ student_number: string; full_name: string; status: "active" | "inactive" | "archived" }> | null;
  }>).flatMap((row) => {
    const student = firstRelation(row.students);

    if (!student) {
      return [];
    }

    return {
      enrolmentId: row.id,
      studentId: row.student_id,
      studentNumber: student.student_number,
      fullName: student.full_name,
      status: student.status,
      enrolmentDate: row.enrolment_date,
      enrolmentStatus: row.status,
    };
  });
}

async function getAvailableTeachers(classId: string): Promise<SelectOption[]> {
  const supabase = await createAcademicSupabaseClient();
  const { data: assigned } = await supabase.from("class_teachers").select("teacher_id").eq("class_id", classId).is("deleted_at", null);
  const assignedIds = ((assigned ?? []) as Array<{ teacher_id: string }>).map((row) => row.teacher_id);
  let query = supabase.from("teachers").select("id, teacher_number, full_name").eq("status", "active").is("deleted_at", null).order("full_name");

  if (assignedIds.length > 0) {
    query = query.not("id", "in", `(${assignedIds.join(",")})`);
  }

  const { data } = await query.limit(100);

  return ((data ?? []) as Array<{ id: string; teacher_number: string; full_name: string }>).map((teacher) => ({
    id: teacher.id,
    label: teacher.full_name,
    helper: teacher.teacher_number,
  }));
}

async function getAvailableStudents(classId: string): Promise<SelectOption[]> {
  const supabase = await createAcademicSupabaseClient();
  const { data: enrolled } = await supabase.from("student_enrolments").select("student_id").eq("class_id", classId).is("deleted_at", null);
  const enrolledIds = ((enrolled ?? []) as Array<{ student_id: string }>).map((row) => row.student_id);
  let query = supabase.from("students").select("id, student_number, full_name").eq("status", "active").is("deleted_at", null).order("full_name");

  if (enrolledIds.length > 0) {
    query = query.not("id", "in", `(${enrolledIds.join(",")})`);
  }

  const { data } = await query.limit(100);

  return ((data ?? []) as Array<{ id: string; student_number: string; full_name: string }>).map((student) => ({
    id: student.id,
    label: student.full_name,
    helper: student.student_number,
  }));
}

export async function listActiveCourses(): Promise<SelectOption[]> {
  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase.from("courses").select("id, course_code, name").eq("status", "active").is("deleted_at", null).order("name");

  return ((data ?? []) as Array<{ id: string; course_code: string; name: string }>).map((course) => ({
    id: course.id,
    label: course.name,
    helper: course.course_code,
  }));
}

export async function createCourse(profile: UserProfile, input: CourseFormInput): Promise<string> {
  if (!canManageCourses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({
      branch_id: profile.branchId,
      course_code: input.courseCode,
      name: input.name,
      description: input.description,
      level: input.level,
      minimum_age: input.minimumAge ?? null,
      maximum_age: input.maximumAge ?? null,
      status: input.status,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function updateCourse(profile: UserProfile, courseId: string, input: CourseFormInput): Promise<void> {
  if (!canManageCourses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase
    .from("courses")
    .update({
      course_code: input.courseCode,
      name: input.name,
      description: input.description,
      level: input.level,
      minimum_age: input.minimumAge ?? null,
      maximum_age: input.maximumAge ?? null,
      status: input.status,
      updated_by: profile.id,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
    })
    .eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCourseStatus(profile: UserProfile, courseId: string, input: CourseStatusInput): Promise<void> {
  if (!canManageCourses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase
    .from("courses")
    .update({
      status: input.status,
      updated_by: profile.id,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
    })
    .eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createClass(profile: UserProfile, input: ClassFormInput): Promise<string> {
  if (!canManageClasses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      branch_id: profile.branchId,
      class_code: input.classCode,
      course_id: input.courseId,
      name: input.name,
      capacity: input.capacity,
      status: input.status,
      start_date: input.startDate,
      end_date: input.endDate,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function updateClass(profile: UserProfile, classId: string, input: ClassFormInput): Promise<void> {
  if (!canManageClasses(profile)) {
    throw new Error("forbidden");
  }

  const activeEnrolments = await getActiveEnrolmentCount(classId);

  if (input.capacity < activeEnrolments) {
    throw new Error("capacity_below_enrolments");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase
    .from("classes")
    .update({
      class_code: input.classCode,
      course_id: input.courseId,
      name: input.name,
      capacity: input.capacity,
      status: input.status,
      start_date: input.startDate,
      end_date: input.endDate,
      updated_by: profile.id,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
    })
    .eq("id", classId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateClassStatus(profile: UserProfile, classId: string, input: ClassStatusInput): Promise<void> {
  if (!canManageClasses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase
    .from("classes")
    .update({
      status: input.status,
      updated_by: profile.id,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
    })
    .eq("id", classId);

  if (error) {
    throw new Error(error.message);
  }
}

async function getActiveEnrolmentCount(classId: string): Promise<number> {
  const supabase = await createAcademicSupabaseClient();
  const { count } = await supabase
    .from("student_enrolments")
    .select("id", { count: "exact", head: true })
    .eq("class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null);

  return count ?? 0;
}

export async function assignTeacherToClass(profile: UserProfile, input: TeacherAssignmentInput): Promise<void> {
  if (!canManageClasses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase.from("class_teachers").insert({
    class_id: input.classId,
    teacher_id: input.teacherId,
    role: input.role,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeTeacherFromClass(profile: UserProfile, input: TeacherAssignmentRemoveInput): Promise<void> {
  if (!canManageClasses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase
    .from("class_teachers")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
    })
    .eq("id", input.assignmentId)
    .eq("class_id", input.classId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function enrolStudentInClass(profile: UserProfile, input: StudentEnrolmentInput): Promise<void> {
  if (!canManageEnrolments(profile)) {
    throw new Error("forbidden");
  }

  const classDetail = await getClassDetail(profile, input.classId);

  if (!classDetail) {
    throw new Error("class_not_found");
  }

  if (classDetail.enrolmentCount >= classDetail.capacity) {
    throw new Error("class_full");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase.from("student_enrolments").insert({
    student_id: input.studentId,
    class_id: input.classId,
    enrolment_date: input.enrolmentDate,
    status: "active",
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeStudentFromClass(profile: UserProfile, input: StudentEnrolmentRemoveInput): Promise<void> {
  if (!canManageEnrolments(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createAcademicSupabaseClient();
  const { error } = await supabase
    .from("student_enrolments")
    .update({
      status: "withdrawn",
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
    })
    .eq("id", input.enrolmentId)
    .eq("class_id", input.classId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getStudentEnrolments(profile: UserProfile, studentId: string): Promise<StudentEnrolmentSummary[]> {
  if (!canManageAcademic(profile)) {
    return [];
  }

  const supabase = await createAcademicSupabaseClient();
  const { data } = await supabase
    .from("student_enrolments")
    .select("id, class_id, enrolment_date, status, classes(id, class_code, name, courses(name))")
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("enrolment_date", { ascending: false });

  return ((data ?? []) as unknown as Array<{
    id: string;
    class_id: string;
    enrolment_date: string;
    status: "active" | "completed" | "withdrawn" | "archived";
    classes:
      | { id: string; class_code: string; name: string; courses: { name: string } | Array<{ name: string }> | null }
      | Array<{ id: string; class_code: string; name: string; courses: { name: string } | Array<{ name: string }> | null }>
      | null;
  }>).flatMap((row) => {
    const classRow = firstRelation(row.classes);

    if (!classRow) {
      return [];
    }

    const course = firstRelation(classRow.courses);

    return {
      id: row.id,
      classId: row.class_id,
      classCode: classRow.class_code,
      className: classRow.name,
      courseName: course?.name ?? "Course not found",
      enrolmentDate: row.enrolment_date,
      status: row.status,
    };
  });
}
