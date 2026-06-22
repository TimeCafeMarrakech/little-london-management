import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  EventBookingCancelInput,
  EventBookingInput,
  EventFormInput,
  EventListQuery,
  EventStaffAssignmentInput,
  EventStaffRemoveInput,
} from "@/features/events/schemas";
import type {
  EventBooking,
  EventCategory,
  EventDashboardMetrics,
  EventDetail,
  EventListItem,
  EventListResult,
  EventSelectOption,
  EventStaffAssignment,
  EventTypeOption,
} from "@/features/events/types";
import { hasAnyPermission, hasPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";

type EventTypeRow = {
  id: string;
  name: string;
  category: EventCategory;
  description: string | null;
  status: "active" | "inactive" | "archived";
};

type EventRow = {
  id: string;
  event_type_id: string;
  event_code: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  capacity: number;
  price: number;
  status: EventListItem["status"];
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type EventBookingRow = {
  id: string;
  event_id: string;
  student_id: string;
  parent_id: string;
  booking_status: EventBooking["bookingStatus"];
  payment_status: EventBooking["paymentStatus"];
  invoice_id: string | null;
  notes: string | null;
  created_at: string;
};

type EventStaffRow = {
  id: string;
  event_id: string;
  teacher_id: string | null;
  user_id: string | null;
  role: EventStaffAssignment["role"];
  created_at: string;
};

type CountRow = {
  event_id: string;
};

async function createEventSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canManageEvents(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasPermission(profile, "events.manage.all");
}

export function canReadEvents(profile: UserProfile): boolean {
  return canManageEvents(profile) || (profile.role === "teacher" && hasAnyPermission(profile, ["events.view.assigned_events"]));
}

async function getTeacherProfileId(profile: UserProfile): Promise<string | null> {
  if (profile.role !== "teacher") {
    return null;
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase.from("teachers").select("id").eq("user_id", profile.id).is("deleted_at", null).maybeSingle();

  return data?.id ?? null;
}

async function getAssignedEventIds(profile: UserProfile): Promise<string[]> {
  const teacherId = await getTeacherProfileId(profile);

  if (!teacherId) {
    return [];
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase.from("event_staff_assignments").select("event_id").eq("teacher_id", teacherId).is("deleted_at", null);

  return ((data ?? []) as CountRow[]).map((row) => row.event_id);
}

function buildCountMap(rows: CountRow[] | null): Map<string, number> {
  const counts = new Map<string, number>();

  (rows ?? []).forEach((row) => counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1));

  return counts;
}

async function getEventTypesMap(eventTypeIds: string[]): Promise<Map<string, EventTypeRow>> {
  if (eventTypeIds.length === 0) {
    return new Map();
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase.from("event_types").select("id, name, category, description, status").in("id", eventTypeIds);

  return new Map(((data ?? []) as EventTypeRow[]).map((type) => [type.id, type]));
}

async function getEventBookingCounts(eventIds: string[]): Promise<Map<string, number>> {
  if (eventIds.length === 0) {
    return new Map();
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase
    .from("event_bookings")
    .select("event_id")
    .in("event_id", eventIds)
    .in("booking_status", ["pending", "confirmed", "attended"])
    .is("deleted_at", null);

  return buildCountMap((data ?? []) as CountRow[]);
}

async function getEventStaffCounts(eventIds: string[]): Promise<Map<string, number>> {
  if (eventIds.length === 0) {
    return new Map();
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase.from("event_staff_assignments").select("event_id").in("event_id", eventIds).is("deleted_at", null);

  return buildCountMap((data ?? []) as CountRow[]);
}

function toEventListItem(
  row: EventRow,
  eventTypes: Map<string, EventTypeRow>,
  bookingCounts: Map<string, number>,
  staffCounts: Map<string, number>,
): EventListItem {
  const eventType = eventTypes.get(row.event_type_id);

  return {
    id: row.id,
    eventTypeId: row.event_type_id,
    eventTypeName: eventType?.name ?? "Event type not found",
    category: eventType?.category ?? "other",
    eventCode: row.event_code,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    endTime: row.end_time,
    capacity: row.capacity,
    price: Number(row.price ?? 0),
    status: row.status,
    location: row.location,
    notes: row.notes,
    bookingCount: bookingCounts.get(row.id) ?? 0,
    staffCount: staffCounts.get(row.id) ?? 0,
  };
}

export async function listEvents(profile: UserProfile, filters: EventListQuery): Promise<EventListResult> {
  noStore();

  if (!canReadEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  let query = supabase
    .from("events")
    .select("id, event_type_id, event_code, title, description, start_date, end_date, start_time, end_time, capacity, price, status, location, notes, created_at, updated_at", { count: "exact" });

  if (!canManageEvents(profile)) {
    const assignedEventIds = await getAssignedEventIds(profile);

    if (assignedEventIds.length === 0) {
      return { events: [], metrics: await getEventMetrics(profile), totalRecords: 0, totalPages: 0, page: filters.page, pageSize: filters.pageSize };
    }

    query = query.in("id", assignedEventIds).is("deleted_at", null);
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

  if (filters.dateFrom) {
    query = query.gte("start_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("start_date", filters.dateTo);
  }

  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,event_code.ilike.%${filters.query}%,location.ilike.%${filters.query}%`);
  }

  const sort = filters.sort;
  const { data, error, count } = await query.order(sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  let rows = (data ?? []) as EventRow[];
  const eventTypes = await getEventTypesMap([...new Set(rows.map((row) => row.event_type_id))]);

  if (filters.category !== "all") {
    rows = rows.filter((row) => eventTypes.get(row.event_type_id)?.category === filters.category);
  }

  const eventIds = rows.map((row) => row.id);
  const [bookingCounts, staffCounts, metrics] = await Promise.all([
    getEventBookingCounts(eventIds),
    getEventStaffCounts(eventIds),
    getEventMetrics(profile),
  ]);

  return {
    events: rows.map((row) => toEventListItem(row, eventTypes, bookingCounts, staffCounts)),
    metrics,
    totalRecords: filters.category === "all" ? count ?? 0 : rows.length,
    totalPages: Math.ceil((filters.category === "all" ? count ?? 0 : rows.length) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getEventMetrics(profile: UserProfile): Promise<EventDashboardMetrics> {
  if (!canReadEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  let visibleEventIds: string[] | null = null;

  if (!canManageEvents(profile)) {
    visibleEventIds = await getAssignedEventIds(profile);

    if (visibleEventIds.length === 0) {
      return { upcomingEvents: 0, activeWorkshops: 0, holidayCamps: 0, birthdayEvents: 0, eventsNearCapacity: 0, totalBookings: 0 };
    }
  }

  let eventsQuery = supabase
    .from("events")
    .select("id, event_type_id, capacity, start_date, status")
    .is("deleted_at", null);

  if (visibleEventIds) {
    eventsQuery = eventsQuery.in("id", visibleEventIds);
  }

  const { data: eventData } = await eventsQuery;
  const eventRows = (eventData ?? []) as Array<{ id: string; event_type_id: string; capacity: number; start_date: string; status: string }>;
  const eventTypes = await getEventTypesMap([...new Set(eventRows.map((row) => row.event_type_id))]);
  const bookingCounts = await getEventBookingCounts(eventRows.map((row) => row.id));
  const nearCapacity = eventRows.filter((row) => (bookingCounts.get(row.id) ?? 0) >= Math.ceil(row.capacity * 0.8)).length;

  return {
    upcomingEvents: eventRows.filter((row) => row.start_date >= today && row.status === "active").length,
    activeWorkshops: eventRows.filter((row) => row.status === "active" && eventTypes.get(row.event_type_id)?.category === "workshop").length,
    holidayCamps: eventRows.filter((row) => row.status === "active" && eventTypes.get(row.event_type_id)?.category === "holiday_camp").length,
    birthdayEvents: eventRows.filter((row) => row.status === "active" && eventTypes.get(row.event_type_id)?.category === "birthday_event").length,
    eventsNearCapacity: nearCapacity,
    totalBookings: [...bookingCounts.values()].reduce((sum, value) => sum + value, 0),
  };
}

export async function getEventDetail(profile: UserProfile, eventId: string): Promise<EventDetail | null> {
  noStore();

  if (!canReadEvents(profile)) {
    throw new Error("forbidden");
  }

  if (!canManageEvents(profile)) {
    const assignedEventIds = await getAssignedEventIds(profile);

    if (!assignedEventIds.includes(eventId)) {
      return null;
    }
  }

  const supabase = await createEventSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, event_type_id, event_code, title, description, start_date, end_date, start_time, end_time, capacity, price, status, location, notes, created_at, updated_at")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as EventRow;
  const [eventTypes, bookingCounts, staffCounts, bookings, staffAssignments, availableStudents, availableParents, availableTeachers] = await Promise.all([
    getEventTypesMap([row.event_type_id]),
    getEventBookingCounts([eventId]),
    getEventStaffCounts([eventId]),
    getEventBookings(eventId),
    getEventStaffAssignments(eventId),
    canManageEvents(profile) ? getAvailableStudents(eventId) : Promise.resolve([]),
    canManageEvents(profile) ? getAvailableParents() : Promise.resolve([]),
    canManageEvents(profile) ? getAvailableTeachers(eventId) : Promise.resolve([]),
  ]);

  return {
    ...toEventListItem(row, eventTypes, bookingCounts, staffCounts),
    bookings,
    staffAssignments,
    availableStudents,
    availableParents,
    availableTeachers,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getEventBookings(eventId: string): Promise<EventBooking[]> {
  const supabase = await createEventSupabaseClient();
  const { data } = await supabase
    .from("event_bookings")
    .select("id, event_id, student_id, parent_id, booking_status, payment_status, invoice_id, notes, created_at")
    .eq("event_id", eventId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as EventBookingRow[];
  const [students, parents] = await Promise.all([
    getStudentMap([...new Set(rows.map((row) => row.student_id))]),
    getParentMap([...new Set(rows.map((row) => row.parent_id))]),
  ]);

  return rows.map((row) => ({
    id: row.id,
    eventId: row.event_id,
    studentId: row.student_id,
    studentName: students.get(row.student_id)?.name ?? "Student not found",
    studentNumber: students.get(row.student_id)?.helper ?? "",
    parentId: row.parent_id,
    parentName: parents.get(row.parent_id)?.label ?? "Parent not found",
    bookingStatus: row.booking_status,
    paymentStatus: row.payment_status,
    invoiceId: row.invoice_id,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

async function getEventStaffAssignments(eventId: string): Promise<EventStaffAssignment[]> {
  const supabase = await createEventSupabaseClient();
  const { data } = await supabase
    .from("event_staff_assignments")
    .select("id, event_id, teacher_id, user_id, role, created_at")
    .eq("event_id", eventId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as EventStaffRow[];
  const teacherIds = rows.flatMap((row) => (row.teacher_id ? [row.teacher_id] : []));
  const teachers = await getTeacherMap(teacherIds);

  return rows.map((row) => ({
    id: row.id,
    eventId: row.event_id,
    teacherId: row.teacher_id,
    teacherName: row.teacher_id ? teachers.get(row.teacher_id)?.label ?? "Teacher not found" : null,
    teacherNumber: row.teacher_id ? teachers.get(row.teacher_id)?.helper ?? null : null,
    userId: row.user_id,
    userName: null,
    role: row.role,
    createdAt: row.created_at,
  }));
}

async function getStudentMap(studentIds: string[]): Promise<Map<string, { name: string; helper: string }>> {
  if (studentIds.length === 0) {
    return new Map();
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase.from("students").select("id, full_name, student_number").in("id", studentIds);

  return new Map(((data ?? []) as Array<{ id: string; full_name: string; student_number: string }>).map((row) => [row.id, { name: row.full_name, helper: row.student_number }]));
}

async function getParentMap(parentIds: string[]): Promise<Map<string, EventSelectOption>> {
  if (parentIds.length === 0) {
    return new Map();
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase.from("parents").select("id, full_name, phone").in("id", parentIds);

  return new Map(((data ?? []) as Array<{ id: string; full_name: string; phone: string }>).map((row) => [row.id, { id: row.id, label: row.full_name, helper: row.phone }]));
}

async function getTeacherMap(teacherIds: string[]): Promise<Map<string, EventSelectOption>> {
  if (teacherIds.length === 0) {
    return new Map();
  }

  const supabase = await createEventSupabaseClient();
  const { data } = await supabase.from("teachers").select("id, full_name, teacher_number").in("id", teacherIds);

  return new Map(((data ?? []) as Array<{ id: string; full_name: string; teacher_number: string }>).map((row) => [row.id, { id: row.id, label: row.full_name, helper: row.teacher_number }]));
}

export async function listEventTypes(profile: UserProfile): Promise<EventTypeOption[]> {
  if (!canManageEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const { data, error } = await supabase
    .from("event_types")
    .select("id, name, category, description")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("category")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as EventTypeRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    helper: row.description ?? row.category.replace("_", " "),
  }));
}

async function getAvailableStudents(eventId: string): Promise<EventSelectOption[]> {
  const supabase = await createEventSupabaseClient();
  const { data: booked } = await supabase.from("event_bookings").select("student_id").eq("event_id", eventId).is("deleted_at", null);
  const bookedIds = ((booked ?? []) as Array<{ student_id: string }>).map((row) => row.student_id);
  let query = supabase.from("students").select("id, student_number, full_name").eq("status", "active").is("deleted_at", null).order("full_name");

  if (bookedIds.length > 0) {
    query = query.not("id", "in", `(${bookedIds.join(",")})`);
  }

  const { data } = await query.limit(200);

  return ((data ?? []) as Array<{ id: string; student_number: string; full_name: string }>).map((row) => ({
    id: row.id,
    label: row.full_name,
    helper: row.student_number,
  }));
}

async function getAvailableParents(): Promise<EventSelectOption[]> {
  const supabase = await createEventSupabaseClient();
  const { data } = await supabase
    .from("parents")
    .select("id, full_name, phone")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("full_name")
    .limit(200);

  return ((data ?? []) as Array<{ id: string; full_name: string; phone: string }>).map((row) => ({
    id: row.id,
    label: row.full_name,
    helper: row.phone,
  }));
}

async function getAvailableTeachers(eventId: string): Promise<EventSelectOption[]> {
  const supabase = await createEventSupabaseClient();
  const { data: assigned } = await supabase.from("event_staff_assignments").select("teacher_id").eq("event_id", eventId).is("deleted_at", null);
  const assignedIds = ((assigned ?? []) as Array<{ teacher_id: string | null }>).flatMap((row) => (row.teacher_id ? [row.teacher_id] : []));
  let query = supabase.from("teachers").select("id, full_name, teacher_number").eq("status", "active").is("deleted_at", null).order("full_name");

  if (assignedIds.length > 0) {
    query = query.not("id", "in", `(${assignedIds.join(",")})`);
  }

  const { data } = await query.limit(100);

  return ((data ?? []) as Array<{ id: string; full_name: string; teacher_number: string }>).map((row) => ({
    id: row.id,
    label: row.full_name,
    helper: row.teacher_number,
  }));
}

export async function createEvent(profile: UserProfile, input: EventFormInput): Promise<string> {
  if (!canManageEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      branch_id: profile.branchId,
      event_type_id: input.eventTypeId,
      event_code: input.eventCode,
      title: input.title,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      start_time: input.startTime,
      end_time: input.endTime,
      capacity: input.capacity,
      price: input.price,
      status: input.status,
      location: input.location,
      notes: input.notes,
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

export async function updateEvent(profile: UserProfile, eventId: string, input: EventFormInput): Promise<void> {
  if (!canManageEvents(profile)) {
    throw new Error("forbidden");
  }

  const bookingCount = await getEventBookingCounts([eventId]);

  if (input.capacity < (bookingCount.get(eventId) ?? 0)) {
    throw new Error("capacity_below_bookings");
  }

  const supabase = await createEventSupabaseClient();
  const { error } = await supabase
    .from("events")
    .update({
      event_type_id: input.eventTypeId,
      event_code: input.eventCode,
      title: input.title,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      start_time: input.startTime,
      end_time: input.endTime,
      capacity: input.capacity,
      price: input.price,
      status: input.status,
      location: input.location,
      notes: input.notes,
      updated_by: profile.id,
      deleted_at: input.status === "archived" ? new Date().toISOString() : null,
      deleted_by: input.status === "archived" ? profile.id : null,
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function bookStudentIntoEvent(profile: UserProfile, input: EventBookingInput): Promise<void> {
  if (!canManageEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const { error } = await supabase.rpc("book_event_student", {
    p_event_id: input.eventId,
    p_student_id: input.studentId,
    p_parent_id: input.parentId,
    p_booking_status: input.bookingStatus,
    p_payment_status: input.paymentStatus,
    p_invoice_id: input.invoiceId,
    p_notes: input.notes,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function cancelEventBooking(profile: UserProfile, input: EventBookingCancelInput): Promise<void> {
  if (!canManageEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const { error } = await supabase.rpc("cancel_event_booking", {
    p_event_id: input.eventId,
    p_booking_id: input.bookingId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function assignStaffToEvent(profile: UserProfile, input: EventStaffAssignmentInput): Promise<void> {
  if (!canManageEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const { error } = await supabase.from("event_staff_assignments").insert({
    event_id: input.eventId,
    teacher_id: input.teacherId,
    role: input.role,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeStaffFromEvent(profile: UserProfile, input: EventStaffRemoveInput): Promise<void> {
  if (!canManageEvents(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createEventSupabaseClient();
  const { error } = await supabase
    .from("event_staff_assignments")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
    })
    .eq("id", input.assignmentId)
    .eq("event_id", input.eventId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}
