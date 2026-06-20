import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { hasAnyPermission, hasPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";
import type {
  AllergySummary,
  EmergencyContactSummary,
  MedicalProfileSummary,
  ParentRelationshipSummary,
  StudentDashboardMetrics,
  StudentDetail,
  StudentListItem,
  StudentListResult,
  StudentStatusHistoryItem,
} from "@/features/students/types";
import type { StudentFormInput, StudentListQuery, StudentStatusInput } from "@/features/students/schemas";

type StudentRow = {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: string | null;
  primary_language: string | null;
  school_name: string | null;
  medical_notes: string | null;
  emergency_notes: string | null;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
};

type CountRow = {
  student_id: string;
};

async function createStudentSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canManageStudents(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasPermission(profile, "students.manage.all");
}

export function canReadStudentModule(profile: UserProfile): boolean {
  return canManageStudents(profile) || hasAnyPermission(profile, ["students.view.assigned_students"]);
}

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function toStudentListItem(
  row: StudentRow,
  parentCounts: Map<string, number>,
  emergencyCounts: Map<string, number>,
  allergyCounts: Map<string, number>,
): StudentListItem {
  return {
    id: row.id,
    studentNumber: row.student_number,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    age: calculateAge(row.date_of_birth),
    status: row.status,
    primaryLanguage: row.primary_language,
    schoolName: row.school_name,
    parentCount: parentCounts.get(row.id) ?? 0,
    emergencyContactCount: emergencyCounts.get(row.id) ?? 0,
    allergyCount: allergyCounts.get(row.id) ?? 0,
  };
}

function buildCountMap(rows: CountRow[] | null): Map<string, number> {
  const counts = new Map<string, number>();

  (rows ?? []).forEach((row) => {
    counts.set(row.student_id, (counts.get(row.student_id) ?? 0) + 1);
  });

  return counts;
}

export async function listStudents(profile: UserProfile, filters: StudentListQuery): Promise<StudentListResult> {
  noStore();

  if (!canReadStudentModule(profile)) {
    throw new Error("forbidden");
  }

  if (profile.role === "teacher" && !canManageStudents(profile)) {
    return {
      students: [],
      metrics: await getStudentMetrics(profile),
      totalRecords: 0,
      totalPages: 0,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  const supabase = await createStudentSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("students")
    .select(
      "id, student_number, first_name, last_name, full_name, date_of_birth, gender, primary_language, school_name, medical_notes, emergency_notes, status, created_at, updated_at",
      { count: "exact" },
    )
    .is("deleted_at", null);

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.query) {
    query = query.or(
      `full_name.ilike.%${filters.query}%,student_number.ilike.%${filters.query}%,school_name.ilike.%${filters.query}%`,
    );
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as StudentRow[];
  const studentIds = rows.map((student) => student.id);
  const [parentCounts, emergencyCounts, allergyCounts, metrics] = await Promise.all([
    getRelatedCount("parent_student_relationships", studentIds),
    getRelatedCount("emergency_contacts", studentIds),
    getRelatedCount("student_allergies", studentIds),
    getStudentMetrics(profile),
  ]);

  return {
    students: rows.map((row) => toStudentListItem(row, parentCounts, emergencyCounts, allergyCounts)),
    metrics,
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

async function getRelatedCount(table: "parent_student_relationships" | "emergency_contacts" | "student_allergies", studentIds: string[]) {
  if (studentIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createStudentSupabaseClient();
  const { data } = await supabase.from(table).select("student_id").in("student_id", studentIds).is("deleted_at", null);

  return buildCountMap((data ?? []) as CountRow[]);
}

export async function getStudentMetrics(profile: UserProfile): Promise<StudentDashboardMetrics> {
  if (!canReadStudentModule(profile)) {
    throw new Error("forbidden");
  }

  if (profile.role === "teacher" && !canManageStudents(profile)) {
    return {
      totalStudents: 0,
      activeStudents: 0,
      inactiveStudents: 0,
      archivedStudents: 0,
      medicalAlerts: 0,
    };
  }

  const supabase = await createStudentSupabaseClient();
  const [total, active, inactive, archived, allergies] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "inactive").is("deleted_at", null),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "archived"),
    supabase.from("student_allergies").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
  ]);

  return {
    totalStudents: total.count ?? 0,
    activeStudents: active.count ?? 0,
    inactiveStudents: inactive.count ?? 0,
    archivedStudents: archived.count ?? 0,
    medicalAlerts: allergies.count ?? 0,
  };
}

export async function getStudentDetail(profile: UserProfile, studentId: string): Promise<StudentDetail | null> {
  noStore();

  if (!canReadStudentModule(profile)) {
    throw new Error("forbidden");
  }

  if (profile.role === "teacher" && !canManageStudents(profile)) {
    return null;
  }

  const supabase = await createStudentSupabaseClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, student_number, first_name, last_name, full_name, date_of_birth, gender, primary_language, school_name, medical_notes, emergency_notes, status, created_at, updated_at")
    .eq("id", studentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as StudentRow;
  const [parents, emergencyContacts, allergies, medicalProfile, statusHistory] = await Promise.all([
    getStudentParents(studentId),
    getStudentEmergencyContacts(studentId),
    getStudentAllergies(studentId),
    getStudentMedicalProfile(studentId),
    getStudentStatusHistory(studentId),
  ]);

  return {
    ...toStudentListItem(row, new Map([[studentId, parents.length]]), new Map([[studentId, emergencyContacts.length]]), new Map([[studentId, allergies.length]])),
    gender: row.gender,
    medicalNotes: row.medical_notes,
    emergencyNotes: row.emergency_notes,
    parents,
    emergencyContacts,
    allergies,
    medicalProfile,
    statusHistory,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getStudentParents(studentId: string): Promise<ParentRelationshipSummary[]> {
  const supabase = await createStudentSupabaseClient();
  const { data } = await supabase
    .from("parent_student_relationships")
    .select("id, parent_full_name, parent_email, parent_phone, relationship_type, is_primary_contact, can_pick_up, receives_invoices, receives_announcements")
    .eq("student_id", studentId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("is_primary_contact", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    parentFullName: row.parent_full_name,
    parentEmail: row.parent_email,
    parentPhone: row.parent_phone,
    relationshipType: row.relationship_type,
    isPrimaryContact: row.is_primary_contact,
    canPickUp: row.can_pick_up,
    receivesInvoices: row.receives_invoices,
    receivesAnnouncements: row.receives_announcements,
  }));
}

async function getStudentEmergencyContacts(studentId: string): Promise<EmergencyContactSummary[]> {
  const supabase = await createStudentSupabaseClient();
  const { data } = await supabase
    .from("emergency_contacts")
    .select("id, full_name, relationship, phone, alternate_phone, priority, notes")
    .eq("student_id", studentId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("priority", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    relationship: row.relationship,
    phone: row.phone,
    alternatePhone: row.alternate_phone,
    priority: row.priority,
    notes: row.notes,
  }));
}

async function getStudentAllergies(studentId: string): Promise<AllergySummary[]> {
  const supabase = await createStudentSupabaseClient();
  const { data } = await supabase
    .from("student_allergies")
    .select("id, allergen, severity, reaction, treatment, notes")
    .eq("student_id", studentId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("severity", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    allergen: row.allergen,
    severity: row.severity,
    reaction: row.reaction,
    treatment: row.treatment,
    notes: row.notes,
  }));
}

async function getStudentMedicalProfile(studentId: string): Promise<MedicalProfileSummary | null> {
  const supabase = await createStudentSupabaseClient();
  const { data } = await supabase
    .from("student_medical_profiles")
    .select("doctor_name, doctor_phone, insurance_provider, policy_number, medical_conditions, medication_notes, dietary_requirements, emergency_medical_consent")
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    doctorName: data.doctor_name,
    doctorPhone: data.doctor_phone,
    insuranceProvider: data.insurance_provider,
    policyNumber: data.policy_number,
    medicalConditions: data.medical_conditions,
    medicationNotes: data.medication_notes,
    dietaryRequirements: data.dietary_requirements,
    emergencyMedicalConsent: data.emergency_medical_consent,
  };
}

async function getStudentStatusHistory(studentId: string): Promise<StudentStatusHistoryItem[]> {
  const supabase = await createStudentSupabaseClient();
  const { data } = await supabase
    .from("student_status_history")
    .select("id, from_status, to_status, reason, changed_at")
    .eq("student_id", studentId)
    .order("changed_at", { ascending: false })
    .limit(6);

  return (data ?? []).map((row) => ({
    id: row.id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    reason: row.reason,
    changedAt: row.changed_at,
  }));
}

export async function createStudent(profile: UserProfile, input: StudentFormInput): Promise<string> {
  if (!canManageStudents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createStudentSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const { data, error } = await supabase
    .from("students")
    .insert({
      branch_id: profile.branchId,
      student_number: input.studentNumber,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: fullName,
      date_of_birth: input.dateOfBirth.toISOString().slice(0, 10),
      gender: input.gender,
      primary_language: input.primaryLanguage,
      school_name: input.schoolName,
      medical_notes: input.medicalNotes,
      emergency_notes: input.emergencyNotes,
      status: input.status,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await syncStudentRelatedRecords(data.id, profile, input);
  await recordStudentStatusChange(data.id, null, input.status, "Student profile created.", profile.id);

  return data.id;
}

export async function updateStudent(profile: UserProfile, studentId: string, input: StudentFormInput): Promise<void> {
  if (!canManageStudents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createStudentSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const { error } = await supabase
    .from("students")
    .update({
      student_number: input.studentNumber,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: fullName,
      date_of_birth: input.dateOfBirth.toISOString().slice(0, 10),
      gender: input.gender,
      primary_language: input.primaryLanguage,
      school_name: input.schoolName,
      medical_notes: input.medicalNotes,
      emergency_notes: input.emergencyNotes,
      status: input.status,
      updated_by: profile.id,
    })
    .eq("id", studentId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  await syncStudentRelatedRecords(studentId, profile, input);
}

export async function updateStudentStatus(profile: UserProfile, studentId: string, input: StudentStatusInput): Promise<void> {
  if (!canManageStudents(profile)) {
    throw new Error("forbidden");
  }

  const current = await getStudentDetail(profile, studentId);

  if (!current) {
    throw new Error("not_found");
  }

  const supabase = await createStudentSupabaseClient();
  const { error } = await supabase
    .from("students")
    .update({
      status: input.status,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
      updated_by: profile.id,
    })
    .eq("id", studentId);

  if (error) {
    throw new Error(error.message);
  }

  await recordStudentStatusChange(studentId, current.status, input.status, input.reason || null, profile.id);
}

async function syncStudentRelatedRecords(studentId: string, profile: UserProfile, input: StudentFormInput): Promise<void> {
  const supabase = await createStudentSupabaseClient();

  if (input.parentName) {
    await supabase.from("parent_student_relationships").insert({
      student_id: studentId,
      parent_full_name: input.parentName,
      parent_email: input.parentEmail,
      parent_phone: input.parentPhone,
      relationship_type: input.parentRelationshipType,
      is_primary_contact: true,
      can_pick_up: true,
      receives_invoices: true,
      receives_announcements: true,
      created_by: profile.id,
      updated_by: profile.id,
    });
  }

  if (input.emergencyContactName && input.emergencyContactRelationship && input.emergencyContactPhone) {
    await supabase.from("emergency_contacts").insert({
      student_id: studentId,
      full_name: input.emergencyContactName,
      relationship: input.emergencyContactRelationship,
      phone: input.emergencyContactPhone,
      priority: 1,
      created_by: profile.id,
      updated_by: profile.id,
    });
  }

  if (input.doctorName || input.doctorPhone || input.medicalConditions || input.medicationNotes || input.dietaryRequirements) {
    await supabase.from("student_medical_profiles").upsert(
      {
        student_id: studentId,
        doctor_name: input.doctorName,
        doctor_phone: input.doctorPhone,
        medical_conditions: input.medicalConditions,
        medication_notes: input.medicationNotes,
        dietary_requirements: input.dietaryRequirements,
        emergency_medical_consent: input.emergencyMedicalConsent,
        updated_by: profile.id,
      },
      { onConflict: "student_id" },
    );
  }

  if (input.allergyName) {
    await supabase.from("student_allergies").insert({
      student_id: studentId,
      allergen: input.allergyName,
      severity: input.allergySeverity ?? "unknown",
      reaction: input.allergyReaction,
      created_by: profile.id,
      updated_by: profile.id,
    });
  }
}

async function recordStudentStatusChange(
  studentId: string,
  fromStatus: "active" | "inactive" | "archived" | null,
  toStatus: "active" | "inactive" | "archived",
  reason: string | null,
  actorId: string,
): Promise<void> {
  const supabase = await createStudentSupabaseClient();

  await supabase.from("student_status_history").insert({
    student_id: studentId,
    from_status: fromStatus,
    to_status: toStatus,
    reason,
    changed_by: actorId,
  });
}
