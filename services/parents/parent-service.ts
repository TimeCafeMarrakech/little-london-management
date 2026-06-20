import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { hasAnyPermission, hasPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";
import type {
  ParentFormInput,
  ParentListQuery,
  ParentRelationshipLinkInput,
  ParentRelationshipUnlinkInput,
  ParentRelationshipUpdateInput,
  ParentStatusInput,
} from "@/features/parents/schemas";
import type {
  AvailableStudentOption,
  LinkedStudentSummary,
  ParentDashboardMetrics,
  ParentDetail,
  ParentListItem,
  ParentListResult,
} from "@/features/parents/types";

type ParentRow = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string;
  alternate_phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  country: string;
  preferred_language: string | null;
  portal_status: "not_invited" | "invited" | "active" | "disabled";
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
};

type RelationshipRow = {
  parent_id: string;
};

type ParentRelationshipDetailRow = {
  id: string;
  student_id: string;
  relationship_type: string;
  is_primary_contact: boolean;
  can_pick_up: boolean;
  receives_invoices: boolean;
  receives_announcements: boolean;
};

type StudentOptionRow = {
  id: string;
  student_number: string;
  full_name: string;
  status: "active" | "inactive" | "archived";
};

async function createParentSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canManageParents(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasPermission(profile, "parents.manage.all");
}

export function canReadParentModule(profile: UserProfile): boolean {
  return canManageParents(profile) || hasAnyPermission(profile, ["parents.view.assigned_students_limited", "parents.view.own"]);
}

function toParentListItem(row: ParentRow, linkedStudentCounts: Map<string, number>): ParentListItem {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    alternatePhone: row.alternate_phone,
    city: row.city,
    preferredLanguage: row.preferred_language,
    portalStatus: row.portal_status,
    status: row.status,
    linkedStudentCount: linkedStudentCounts.get(row.id) ?? 0,
  };
}

function buildRelationshipCountMap(rows: RelationshipRow[] | null): Map<string, number> {
  const counts = new Map<string, number>();

  (rows ?? []).forEach((row) => {
    counts.set(row.parent_id, (counts.get(row.parent_id) ?? 0) + 1);
  });

  return counts;
}

function relationshipDuplicateError(): Error {
  return new Error("duplicate_parent_student_relationship");
}

function assertRelationshipMutation(error: { message: string; code?: string } | null): void {
  if (!error) {
    return;
  }

  if (error.code === "23505" || error.message.includes("duplicate key") || error.message.includes("unique")) {
    throw relationshipDuplicateError();
  }

  throw new Error(error.message);
}

export async function listParents(profile: UserProfile, filters: ParentListQuery): Promise<ParentListResult> {
  noStore();

  if (!canReadParentModule(profile)) {
    throw new Error("forbidden");
  }

  if (!canManageParents(profile)) {
    return {
      parents: [],
      metrics: await getParentMetrics(profile),
      totalRecords: 0,
      totalPages: 0,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  const supabase = await createParentSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("parents")
    .select(
      "id, first_name, last_name, full_name, email, phone, alternate_phone, address_line_1, address_line_2, city, country, preferred_language, portal_status, status, created_at, updated_at",
      { count: "exact" },
    );

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

  if (filters.portalStatus !== "all") {
    query = query.eq("portal_status", filters.portalStatus);
  }

  if (filters.query) {
    query = query.or(`full_name.ilike.%${filters.query}%,email.ilike.%${filters.query}%,phone.ilike.%${filters.query}%`);
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ParentRow[];
  const parentIds = rows.map((parent) => parent.id);
  const [studentCounts, metrics] = await Promise.all([getLinkedStudentCounts(parentIds), getParentMetrics(profile)]);

  return {
    parents: rows.map((row) => toParentListItem(row, studentCounts)),
    metrics,
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

async function getLinkedStudentCounts(parentIds: string[]): Promise<Map<string, number>> {
  if (parentIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createParentSupabaseClient();
  const { data } = await supabase
    .from("parent_student_relationships")
    .select("parent_id")
    .in("parent_id", parentIds)
    .is("deleted_at", null);

  return buildRelationshipCountMap((data ?? []) as RelationshipRow[]);
}

export async function getParentMetrics(profile: UserProfile): Promise<ParentDashboardMetrics> {
  if (!canReadParentModule(profile)) {
    throw new Error("forbidden");
  }

  if (!canManageParents(profile)) {
    return {
      totalParents: 0,
      activeParents: 0,
      invitedParents: 0,
      archivedParents: 0,
    };
  }

  const supabase = await createParentSupabaseClient();
  const [total, active, invited, archived] = await Promise.all([
    supabase.from("parents").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("parents").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("parents").select("id", { count: "exact", head: true }).eq("portal_status", "invited").is("deleted_at", null),
    supabase.from("parents").select("id", { count: "exact", head: true }).eq("status", "archived"),
  ]);

  return {
    totalParents: total.count ?? 0,
    activeParents: active.count ?? 0,
    invitedParents: invited.count ?? 0,
    archivedParents: archived.count ?? 0,
  };
}

export async function getParentDetail(profile: UserProfile, parentId: string): Promise<ParentDetail | null> {
  noStore();

  if (!canReadParentModule(profile)) {
    throw new Error("forbidden");
  }

  if (!canManageParents(profile)) {
    return null;
  }

  const supabase = await createParentSupabaseClient();
  const { data, error } = await supabase
    .from("parents")
    .select("id, first_name, last_name, full_name, email, phone, alternate_phone, address_line_1, address_line_2, city, country, preferred_language, portal_status, status, created_at, updated_at")
    .eq("id", parentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as ParentRow;
  const [linkedStudents, availableStudents] = await Promise.all([getLinkedStudents(parentId), getAvailableStudentsForParent(parentId)]);

  return {
    ...toParentListItem(row, new Map([[parentId, linkedStudents.length]])),
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    country: row.country,
    linkedStudents,
    availableStudents,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getLinkedStudents(parentId: string): Promise<LinkedStudentSummary[]> {
  const supabase = await createParentSupabaseClient();
  const { data } = await supabase
    .from("parent_student_relationships")
    .select("id, student_id, relationship_type, is_primary_contact, can_pick_up, receives_invoices, receives_announcements")
    .eq("parent_id", parentId)
    .is("deleted_at", null);

  const relationships = (data ?? []) as ParentRelationshipDetailRow[];
  const studentIds = relationships.map((relationship) => relationship.student_id);

  if (studentIds.length === 0) {
    return [];
  }

  const { data: studentData } = await supabase
    .from("students")
    .select("id, student_number, full_name, status")
    .in("id", studentIds);

  const students = new Map(
    ((studentData ?? []) as Array<{ id: string; student_number: string; full_name: string; status: "active" | "inactive" | "archived" }>).map(
      (student) => [student.id, student],
    ),
  );

  return relationships.flatMap((relationship) => {
    const student = students.get(relationship.student_id);

    if (!student) {
      return [];
    }

    return {
      relationshipId: relationship.id,
      id: student.id,
      studentNumber: student.student_number,
      fullName: student.full_name,
      status: student.status,
      relationshipType: relationship.relationship_type,
      isPrimaryContact: relationship.is_primary_contact,
      canPickUp: relationship.can_pick_up,
      receivesInvoices: relationship.receives_invoices,
      receivesAnnouncements: relationship.receives_announcements,
    };
  });
}

async function getAvailableStudentsForParent(parentId: string): Promise<AvailableStudentOption[]> {
  const supabase = await createParentSupabaseClient();
  const { data: linkedData, error: linkedError } = await supabase
    .from("parent_student_relationships")
    .select("student_id")
    .eq("parent_id", parentId)
    .is("deleted_at", null);

  if (linkedError) {
    throw new Error(linkedError.message);
  }

  const linkedStudentIds = ((linkedData ?? []) as Array<{ student_id: string }>).map((relationship) => relationship.student_id);
  let query = supabase
    .from("students")
    .select("id, student_number, full_name, status")
    .is("deleted_at", null)
    .neq("status", "archived")
    .order("full_name", { ascending: true })
    .limit(100);

  if (linkedStudentIds.length > 0) {
    query = query.not("id", "in", `(${linkedStudentIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as StudentOptionRow[]).map((student) => ({
    id: student.id,
    studentNumber: student.student_number,
    fullName: student.full_name,
    status: student.status,
  }));
}

export async function createParent(profile: UserProfile, input: ParentFormInput): Promise<string> {
  if (!canManageParents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createParentSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const { data, error } = await supabase
    .from("parents")
    .insert({
      branch_id: profile.branchId,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: fullName,
      email: input.email,
      phone: input.phone,
      alternate_phone: input.alternatePhone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      country: input.country,
      preferred_language: input.preferredLanguage,
      portal_status: input.portalStatus,
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

export async function updateParent(profile: UserProfile, parentId: string, input: ParentFormInput): Promise<void> {
  if (!canManageParents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createParentSupabaseClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const { error } = await supabase
    .from("parents")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: fullName,
      email: input.email,
      phone: input.phone,
      alternate_phone: input.alternatePhone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      country: input.country,
      preferred_language: input.preferredLanguage,
      portal_status: input.portalStatus,
      status: input.status,
      updated_by: profile.id,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
    })
    .eq("id", parentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateParentStatus(profile: UserProfile, parentId: string, input: ParentStatusInput): Promise<void> {
  if (!canManageParents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createParentSupabaseClient();
  const { error } = await supabase
    .from("parents")
    .update({
      status: input.status,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
      updated_by: profile.id,
    })
    .eq("id", parentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function linkStudentToParent(profile: UserProfile, input: ParentRelationshipLinkInput): Promise<void> {
  if (!canManageParents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createParentSupabaseClient();
  const [{ data: parent, error: parentError }, { data: student, error: studentError }, { data: existing, error: existingError }] = await Promise.all([
    supabase
      .from("parents")
      .select("id, full_name, email, phone")
      .eq("id", input.parentId)
      .maybeSingle(),
    supabase
      .from("students")
      .select("id")
      .eq("id", input.studentId)
      .is("deleted_at", null)
      .neq("status", "archived")
      .maybeSingle(),
    supabase
      .from("parent_student_relationships")
      .select("id")
      .eq("parent_id", input.parentId)
      .eq("student_id", input.studentId)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  if (parentError) {
    throw new Error(parentError.message);
  }

  if (studentError) {
    throw new Error(studentError.message);
  }

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!parent) {
    throw new Error("parent_not_found");
  }

  if (!student) {
    throw new Error("student_not_found");
  }

  if (existing) {
    throw relationshipDuplicateError();
  }

  const parentRow = parent as Pick<ParentRow, "id" | "full_name" | "email" | "phone">;
  const { error } = await supabase.from("parent_student_relationships").insert({
    parent_id: input.parentId,
    student_id: input.studentId,
    parent_full_name: parentRow.full_name,
    parent_email: parentRow.email,
    parent_phone: parentRow.phone,
    relationship_type: input.relationshipType,
    status: "active",
    is_primary_contact: false,
    can_pick_up: false,
    receives_invoices: false,
    receives_announcements: true,
    created_by: profile.id,
    updated_by: profile.id,
  });

  assertRelationshipMutation(error);
}

export async function updateParentStudentRelationship(profile: UserProfile, input: ParentRelationshipUpdateInput): Promise<void> {
  if (!canManageParents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createParentSupabaseClient();
  const { error } = await supabase
    .from("parent_student_relationships")
    .update({
      relationship_type: input.relationshipType,
      updated_by: profile.id,
    })
    .eq("id", input.relationshipId)
    .eq("parent_id", input.parentId)
    .is("deleted_at", null);

  assertRelationshipMutation(error);
}

export async function unlinkStudentFromParent(profile: UserProfile, input: ParentRelationshipUnlinkInput): Promise<void> {
  if (!canManageParents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createParentSupabaseClient();
  const { error } = await supabase
    .from("parent_student_relationships")
    .update({
      status: "archived",
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
      updated_by: profile.id,
    })
    .eq("id", input.relationshipId)
    .eq("parent_id", input.parentId)
    .is("deleted_at", null);

  assertRelationshipMutation(error);
}
