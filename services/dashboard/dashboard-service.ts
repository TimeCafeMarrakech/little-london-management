import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserProfile } from "@/lib/auth/types";
import { getAcademicMetrics } from "@/services/academic/academic-service";
import { getAttendanceMetrics } from "@/services/attendance/attendance-service";
import { getEventMetrics } from "@/services/events/event-service";
import { getFinanceMetrics } from "@/services/finance/finance-service";
import { getStudentMetrics } from "@/services/students/student-service";
import { createSupabaseServerClient } from "@/supabase/server";

export type DashboardOutstandingInvoice = {
  id: string;
  invoiceNumber: string;
  family: string;
  dueDate: string;
  balanceDue: number;
  overdue: boolean;
};

export type DashboardUpcomingEvent = {
  id: string;
  title: string;
  startDate: string;
  startTime: string | null;
  capacity: number;
  bookings: number;
};

export type ManagementDashboardData = {
  finance: Awaited<ReturnType<typeof getFinanceMetrics>> | null;
  students: Awaited<ReturnType<typeof getStudentMetrics>>;
  academic: Awaited<ReturnType<typeof getAcademicMetrics>>;
  attendance: Awaited<ReturnType<typeof getAttendanceMetrics>>;
  events: Awaited<ReturnType<typeof getEventMetrics>>;
  outstandingBalance: number;
  outstandingInvoices: DashboardOutstandingInvoice[];
  upcomingEvents: DashboardUpcomingEvent[];
};

type InvoiceRow = { id: string; invoice_number: string; parent_id: string; due_date: string; total: number };
type EventRow = { id: string; title: string; start_date: string; start_time: string | null; capacity: number };

function money(value: unknown): number {
  return Math.round(Number(value ?? 0) * 100) / 100;
}

async function getFinanceHighlights(supabase: SupabaseClient) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: invoiceData } = await supabase
    .from("invoices")
    .select("id, invoice_number, parent_id, due_date, total")
    .in("status", ["issued", "partially_paid"])
    .is("deleted_at", null)
    .order("due_date", { ascending: true });

  const invoices = (invoiceData ?? []) as InvoiceRow[];
  if (invoices.length === 0) {
    return { outstandingBalance: 0, outstandingInvoices: [] as DashboardOutstandingInvoice[] };
  }

  const invoiceIds = invoices.map((invoice) => invoice.id);
  const parentIds = [...new Set(invoices.map((invoice) => invoice.parent_id))];
  const [{ data: allocationData }, { data: parentData }] = await Promise.all([
    supabase.from("payment_allocations").select("invoice_id, amount_allocated").in("invoice_id", invoiceIds),
    supabase.from("parents").select("id, full_name").in("id", parentIds),
  ]);

  const paidByInvoice = new Map<string, number>();
  for (const row of (allocationData ?? []) as Array<{ invoice_id: string; amount_allocated: number }>) {
    paidByInvoice.set(row.invoice_id, money((paidByInvoice.get(row.invoice_id) ?? 0) + Number(row.amount_allocated ?? 0)));
  }
  const parentNames = new Map(((parentData ?? []) as Array<{ id: string; full_name: string }>).map((row) => [row.id, row.full_name]));
  const balances = invoices.map((invoice) => ({ invoice, balance: money(Math.max(Number(invoice.total) - (paidByInvoice.get(invoice.id) ?? 0), 0)) }));

  return {
    outstandingBalance: money(balances.reduce((sum, item) => sum + item.balance, 0)),
    outstandingInvoices: balances
      .filter((item) => item.balance > 0)
      .slice(0, 5)
      .map(({ invoice, balance }) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        family: parentNames.get(invoice.parent_id) ?? "Family not found",
        dueDate: invoice.due_date,
        balanceDue: balance,
        overdue: invoice.due_date < today,
      })),
  };
}

async function getUpcomingEvents(supabase: SupabaseClient): Promise<DashboardUpcomingEvent[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("events")
    .select("id, title, start_date, start_time, capacity")
    .eq("status", "active")
    .gte("start_date", today)
    .is("deleted_at", null)
    .order("start_date", { ascending: true })
    .limit(5);

  const events = (data ?? []) as EventRow[];
  if (events.length === 0) return [];

  const { data: bookingData } = await supabase
    .from("event_bookings")
    .select("event_id")
    .in("event_id", events.map((event) => event.id))
    .in("booking_status", ["pending", "confirmed", "attended"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const booking of (bookingData ?? []) as Array<{ event_id: string }>) {
    counts.set(booking.event_id, (counts.get(booking.event_id) ?? 0) + 1);
  }

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    startDate: event.start_date,
    startTime: event.start_time,
    capacity: event.capacity,
    bookings: counts.get(event.id) ?? 0,
  }));
}

export async function getManagementDashboardData(profile: UserProfile): Promise<ManagementDashboardData> {
  noStore();
  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient;
  const canSeeFinance = profile.role === "super_admin" || profile.role === "admin";

  const [students, academic, attendance, events, finance, financeHighlights, upcomingEvents] = await Promise.all([
    getStudentMetrics(profile),
    getAcademicMetrics(profile),
    getAttendanceMetrics(profile),
    getEventMetrics(profile),
    canSeeFinance ? getFinanceMetrics(profile) : Promise.resolve(null),
    canSeeFinance ? getFinanceHighlights(supabase) : Promise.resolve({ outstandingBalance: 0, outstandingInvoices: [] }),
    getUpcomingEvents(supabase),
  ]);

  return {
    finance,
    students,
    academic,
    attendance,
    events,
    outstandingBalance: financeHighlights.outstandingBalance,
    outstandingInvoices: financeHighlights.outstandingInvoices,
    upcomingEvents,
  };
}
