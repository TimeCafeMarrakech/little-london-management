import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { hasPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";
import type { TeacherFormInput, TeacherListQuery, TeacherStatusInput } from "@/features/teachers/schemas";
import type { TeacherDashboardMetrics, TeacherDetail, TeacherListItem, TeacherListResult } from "@/features/teachers/types";

type TeacherRow = {
  id: string;
  teacher_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive" | "archived";
  employment_type: "full_time" | "part_time" | "contractor" | "substitute";
  hire_date: string | null;
  qualifications: string | null;
  bio: string | null;
  availability_notes: string | null;
  created_at: string;
  updated_at: string;
};

async function createTeacherSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canManageTeachers(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasPermission(profile, "teachers.manage.all");
}

export function canReadTeacherModule(profile: UserProfile): boolean {
  return canManageTeachers(profile) || hasRole(profile, ["teacher"]);
}

function toTeacherListItem(row: TeacherRow): TeacherListItem {
  return {
    id: row.id,
    teacherNumber: row.teacher_number,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    employmentType: row.employment_type,
    hireDate: row.hire_date,
    qualifications: row.qualifications,
    availabilityNotes: row.availability_notes,
  };
}

export async function listTeachers(profile: UserProfile, filters: TeacherListQuery): Promise<TeacherListResult> {
  noStore();

  if (!canReadTeacherModule(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createTeacherSupabaseClient();

  if (!canManageTeachers(profile)) {
    const { data, error } = await supabase
      .from("teachers")
      .select("id, teacher_number, first_name, last_name, full_name, email, phone, status, employment_type, hire_date, qualifications, bio, availability_notes, created_at, updated_at")
      .eq("user_id", profile.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const row = data ? (data as TeacherRow) : null;

    return {
      teachers: row ? [toTeacherListItem(row)] : [],
      metrics: await getTeacherMetrics(profile),
      totalRecords: row ? 1 : 0,
      totalPages: row ? 1 : 0,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  let query = supabase
    .from("teachers")
    .select("id, teacher_number, first_name, last_name, full_name, email, phone, status, employment_type, hire_date, qualifications, bio, availability_notes, created_at, updated_at", {
      count: "exact",
    });

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

  if (filters.employmentType !== "all") {
    query = query.eq("employment_type", filters.employmentType);
  }

  if (filters.query) {
    query = query.or(`full_name.ilike.%${filters.query}%,teacher_number.ilike.%${filters.query}%,email.ilike.%${filters.query}%,phone.ilike.%${filters.query}%`);
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    teachers: ((data ?? []) as TeacherRow[]).map(toTeacherListItem),
    metrics: await getTeacherMetrics(profile),
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getTeacherMetrics(profile: UserProfile): Promise<TeacherDashboardMetrics> {
  if (!canReadTeacherModule(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createTeacherSupabaseClient();

  if (!canManageTeachers(profile)) {
    const { count } = await supabase
      .from("teachers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("deleted_at", null);

    return {
      totalTeachers: count ?? 0,
      activeTeachers: count ?? 0,
      partTimeTeachers: 0,
      archivedTeachers: 0,
    };
  }

  const [total, active, partTime, archived] = await Promise.all([
    supabase.from("teachers").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("teachers").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("teachers").select("id", { count: "exact", head: true }).eq("employment_type", "part_time").is("deleted_at", null),
    supabase.from("teachers").select("id", { count: "exact", head: true }).eq("status", "archived"),
  ]);

  return {
    totalTeachers: total.count ?? 0,
    activeTeachers: active.count ?? 0,
    partTimeTeachers: partTime.count ?? 0,
    archivedTeachers: archived.count ?? 0,
  };
}

export async function getTeacherDetail(profile: UserProfile, teacherId: string): Promise<TeacherDetail | null> {
  noStore();

  if (!canReadTeacherModule(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createTeacherSupabaseClient();
  let query = supabase
    .from("teachers")
    .select("id, teacher_number, first_name, last_name, full_name, email, phone, status, employment_type, hire_date, qualifications, bio, availability_notes, created_at, updated_at")
    .eq("id", teacherId);

  if (!canManageTeachers(profile)) {
    query = query.eq("user_id", profile.id).is("deleted_at", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as TeacherRow;

  return {
    ...toTeacherListItem(row),
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createTeacher(profile: UserProfile, input: TeacherFormInput): Promise<string> {
  if (!canManageTeachers(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createTeacherSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const { data, error } = await supabase
    .from("teachers")
    .insert({
      branch_id: profile.branchId,
      teacher_number: input.teacherNumber,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: fullName,
      email: input.email,
      phone: input.phone,
      status: input.status,
      employment_type: input.employmentType,
      hire_date: input.hireDate,
      qualifications: input.qualifications,
      bio: input.bio,
      availability_notes: input.availabilityNotes,
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

export async function updateTeacher(profile: UserProfile, teacherId: string, input: TeacherFormInput): Promise<void> {
  if (!canManageTeachers(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createTeacherSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const { error } = await supabase
    .from("teachers")
    .update({
      teacher_number: input.teacherNumber,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: fullName,
      email: input.email,
      phone: input.phone,
      status: input.status,
      employment_type: input.employmentType,
      hire_date: input.hireDate,
      qualifications: input.qualifications,
      bio: input.bio,
      availability_notes: input.availabilityNotes,
      updated_by: profile.id,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
    })
    .eq("id", teacherId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateTeacherStatus(profile: UserProfile, teacherId: string, input: TeacherStatusInput): Promise<void> {
  if (!canManageTeachers(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createTeacherSupabaseClient();
  const { error } = await supabase
    .from("teachers")
    .update({
      status: input.status,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
      updated_by: profile.id,
    })
    .eq("id", teacherId);

  if (error) {
    throw new Error(error.message);
  }
}
