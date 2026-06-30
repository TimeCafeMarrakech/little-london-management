import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { InvoiceFormInput, InvoiceListQuery, PaymentFormInput, PaymentListQuery } from "@/features/finance/schemas";
import type {
  BillingSummary,
  FinanceMetrics,
  FinanceOption,
  InvoiceDetail,
  InvoiceItem,
  InvoiceListItem,
  InvoiceListResult,
  PaymentAllocationSummary,
  PaymentDetail,
  PaymentListItem,
  PaymentListResult,
} from "@/features/finance/types";
import { hasAnyPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";

type InvoiceRow = {
  id: string;
  invoice_number: string;
  parent_id: string;
  student_id: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  total: number;
  status: InvoiceListItem["status"];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  payment_number: string;
  parent_id: string;
  student_id: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentListItem["paymentMethod"];
  reference_number: string | null;
  notes: string | null;
  created_at: string;
};

type ParentNameRow = {
  id: string;
  full_name: string;
};

type StudentNameRow = {
  id: string;
  full_name: string;
  student_number?: string;
};

async function createFinanceSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canManageFinance(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["invoices.manage.all", "payments.manage.all"]);
}

function toMoney(value: unknown): number {
  return Number(value ?? 0);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

async function getParentNames(parentIds: string[]): Promise<Map<string, string>> {
  if (parentIds.length === 0) {
    return new Map();
  }

  const supabase = await createFinanceSupabaseClient();
  const { data } = await supabase.from("parents").select("id, full_name").in("id", parentIds);

  return new Map(((data ?? []) as ParentNameRow[]).map((parent) => [parent.id, parent.full_name]));
}

async function getStudentNames(studentIds: string[]): Promise<Map<string, string>> {
  if (studentIds.length === 0) {
    return new Map();
  }

  const supabase = await createFinanceSupabaseClient();
  const { data } = await supabase.from("students").select("id, full_name").in("id", studentIds);

  return new Map(((data ?? []) as StudentNameRow[]).map((student) => [student.id, student.full_name]));
}

async function getInvoicePaidMap(invoiceIds: string[]): Promise<Map<string, number>> {
  if (invoiceIds.length === 0) {
    return new Map();
  }

  const supabase = await createFinanceSupabaseClient();
  const { data } = await supabase.from("payment_allocations").select("invoice_id, amount_allocated").in("invoice_id", invoiceIds);
  const paid = new Map<string, number>();

  ((data ?? []) as Array<{ invoice_id: string; amount_allocated: number }>).forEach((allocation) => {
    paid.set(allocation.invoice_id, roundMoney((paid.get(allocation.invoice_id) ?? 0) + toMoney(allocation.amount_allocated)));
  });

  return paid;
}

function mapInvoice(row: InvoiceRow, parentNames: Map<string, string>, studentNames: Map<string, string>, paidMap: Map<string, number>): InvoiceListItem {
  const amountPaid = paidMap.get(row.id) ?? 0;
  const total = toMoney(row.total);

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    parentId: row.parent_id,
    parentName: parentNames.get(row.parent_id) ?? "Unknown parent",
    studentId: row.student_id,
    studentName: studentNames.get(row.student_id) ?? "Unknown student",
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotal: toMoney(row.subtotal),
    total,
    amountPaid,
    balanceDue: roundMoney(Math.max(total - amountPaid, 0)),
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getFinanceMetrics(profile: UserProfile): Promise<FinanceMetrics> {
  noStore();

  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [paymentRows, openInvoices, overdueInvoices, monthPayments] = await Promise.all([
    supabase.from("payments").select("amount"),
    supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["issued", "partially_paid"]).is("deleted_at", null),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .in("status", ["issued", "partially_paid"])
      .lt("due_date", new Date().toISOString().slice(0, 10))
      .is("deleted_at", null),
    supabase.from("payments").select("amount").gte("payment_date", monthStart.toISOString().slice(0, 10)),
  ]);

  return {
    totalRevenue: roundMoney(((paymentRows.data ?? []) as Array<{ amount: number }>).reduce((sum, payment) => sum + toMoney(payment.amount), 0)),
    outstandingInvoices: openInvoices.count ?? 0,
    overdueInvoices: overdueInvoices.count ?? 0,
    paymentsThisMonth: roundMoney(((monthPayments.data ?? []) as Array<{ amount: number }>).reduce((sum, payment) => sum + toMoney(payment.amount), 0)),
  };
}

export async function listInvoices(profile: UserProfile, filters: InvoiceListQuery): Promise<InvoiceListResult> {
  noStore();

  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("invoices")
    .select("id, invoice_number, parent_id, student_id, issue_date, due_date, subtotal, total, status, notes, created_at, updated_at", {
      count: "exact",
    });

  if (filters.status === "archived") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);

    if (filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
  }

  if (filters.query) {
    query = query.ilike("invoice_number", `%${filters.query}%`);
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as InvoiceRow[];
  const [parentNames, studentNames, paidMap, metrics] = await Promise.all([
    getParentNames([...new Set(rows.map((row) => row.parent_id))]),
    getStudentNames([...new Set(rows.map((row) => row.student_id))]),
    getInvoicePaidMap(rows.map((row) => row.id)),
    getFinanceMetrics(profile),
  ]);

  return {
    invoices: rows.map((row) => mapInvoice(row, parentNames, studentNames, paidMap)),
    metrics,
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

async function getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase
    .from("invoice_items")
    .select("id, description, quantity, unit_price, line_total")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<{ id: string; description: string; quantity: number; unit_price: number; line_total: number }>).map((item) => ({
    id: item.id,
    description: item.description,
    quantity: toMoney(item.quantity),
    unitPrice: toMoney(item.unit_price),
    lineTotal: toMoney(item.line_total),
  }));
}

async function getInvoicePayments(invoiceId: string): Promise<PaymentAllocationSummary[]> {
  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase
    .from("payment_allocations")
    .select("id, payment_id, invoice_id, amount_allocated")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const allocations = (data ?? []) as Array<{ id: string; payment_id: string; invoice_id: string; amount_allocated: number }>;
  const paymentIds = allocations.map((allocation) => allocation.payment_id);

  if (paymentIds.length === 0) {
    return [];
  }

  const { data: paymentData } = await supabase.from("payments").select("id, payment_number").in("id", paymentIds);
  const paymentNumbers = new Map(((paymentData ?? []) as Array<{ id: string; payment_number: string }>).map((payment) => [payment.id, payment.payment_number]));

  return allocations.map((allocation) => ({
    id: allocation.id,
    invoiceId: allocation.invoice_id,
    invoiceNumber: paymentNumbers.get(allocation.payment_id) ?? "Payment",
    amountAllocated: toMoney(allocation.amount_allocated),
  }));
}

export async function getInvoiceDetail(profile: UserProfile, invoiceId: string): Promise<InvoiceDetail | null> {
  noStore();

  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, parent_id, student_id, issue_date, due_date, subtotal, total, status, notes, created_at, updated_at")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as InvoiceRow;
  const [parentNames, studentNames, paidMap, items, payments] = await Promise.all([
    getParentNames([row.parent_id]),
    getStudentNames([row.student_id]),
    getInvoicePaidMap([row.id]),
    getInvoiceItems(invoiceId),
    getInvoicePayments(invoiceId),
  ]);

  return {
    ...mapInvoice(row, parentNames, studentNames, paidMap),
    items,
    payments,
  };
}

export async function createInvoice(profile: UserProfile, input: InvoiceFormInput): Promise<string> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase.rpc("create_invoice_with_items", {
    p_invoice_number: input.invoiceNumber,
    p_parent_id: input.parentId,
    p_student_id: input.studentId,
    p_issue_date: input.issueDate,
    p_due_date: input.dueDate,
    p_status: input.status,
    p_notes: input.notes,
    p_items: input.items,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function updateInvoice(profile: UserProfile, invoiceId: string, input: InvoiceFormInput): Promise<void> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { error } = await supabase.rpc("update_draft_invoice_with_items", {
    p_invoice_id: invoiceId,
    p_invoice_number: input.invoiceNumber,
    p_parent_id: input.parentId,
    p_student_id: input.studentId,
    p_issue_date: input.issueDate,
    p_due_date: input.dueDate,
    p_status: input.status,
    p_notes: input.notes,
    p_items: input.items,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function archiveInvoice(profile: UserProfile, invoiceId: string): Promise<void> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "cancelled",
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
      updated_by: profile.id,
    })
    .eq("id", invoiceId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listPayments(profile: UserProfile, filters: PaymentListQuery): Promise<PaymentListResult> {
  noStore();

  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("payments")
    .select("id, payment_number, parent_id, student_id, payment_date, amount, payment_method, reference_number, notes, created_at", {
      count: "exact",
    });

  if (filters.method !== "all") {
    query = query.eq("payment_method", filters.method);
  }

  if (filters.query) {
    query = query.ilike("payment_number", `%${filters.query}%`);
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as PaymentRow[];
  const paymentIds = rows.map((row) => row.id);
  const [parentNames, studentNames, allocations, metrics] = await Promise.all([
    getParentNames([...new Set(rows.map((row) => row.parent_id))]),
    getStudentNames([...new Set(rows.map((row) => row.student_id))]),
    getPaymentAllocationMap(paymentIds),
    getFinanceMetrics(profile),
  ]);

  return {
    payments: rows.map((row) => mapPayment(row, parentNames, studentNames, allocations)),
    metrics,
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

async function getPaymentAllocationMap(paymentIds: string[]): Promise<Map<string, number>> {
  if (paymentIds.length === 0) {
    return new Map();
  }

  const supabase = await createFinanceSupabaseClient();
  const { data } = await supabase.from("payment_allocations").select("payment_id, amount_allocated").in("payment_id", paymentIds);
  const allocated = new Map<string, number>();

  ((data ?? []) as Array<{ payment_id: string; amount_allocated: number }>).forEach((allocation) => {
    allocated.set(allocation.payment_id, roundMoney((allocated.get(allocation.payment_id) ?? 0) + toMoney(allocation.amount_allocated)));
  });

  return allocated;
}

function mapPayment(
  row: PaymentRow,
  parentNames: Map<string, string>,
  studentNames: Map<string, string>,
  allocations: Map<string, number>,
): PaymentListItem {
  return {
    id: row.id,
    paymentNumber: row.payment_number,
    parentId: row.parent_id,
    parentName: parentNames.get(row.parent_id) ?? "Unknown parent",
    studentId: row.student_id,
    studentName: studentNames.get(row.student_id) ?? "Unknown student",
    paymentDate: row.payment_date,
    amount: toMoney(row.amount),
    paymentMethod: row.payment_method,
    referenceNumber: row.reference_number,
    notes: row.notes,
    createdAt: row.created_at,
    allocatedAmount: allocations.get(row.id) ?? 0,
  };
}

export async function getPaymentDetail(profile: UserProfile, paymentId: string): Promise<PaymentDetail | null> {
  noStore();

  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, payment_number, parent_id, student_id, payment_date, amount, payment_method, reference_number, notes, created_at")
    .eq("id", paymentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as PaymentRow;
  const [parentNames, studentNames, allocationMap, allocations] = await Promise.all([
    getParentNames([row.parent_id]),
    getStudentNames([row.student_id]),
    getPaymentAllocationMap([row.id]),
    getPaymentAllocations(row.id),
  ]);

  return {
    ...mapPayment(row, parentNames, studentNames, allocationMap),
    allocations,
  };
}

async function getPaymentAllocations(paymentId: string): Promise<PaymentAllocationSummary[]> {
  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase
    .from("payment_allocations")
    .select("id, invoice_id, amount_allocated")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const allocations = (data ?? []) as Array<{ id: string; invoice_id: string; amount_allocated: number }>;
  const invoices = await getInvoiceNumbers(allocations.map((allocation) => allocation.invoice_id));

  return allocations.map((allocation) => ({
    id: allocation.id,
    invoiceId: allocation.invoice_id,
    invoiceNumber: invoices.get(allocation.invoice_id) ?? "Invoice",
    amountAllocated: toMoney(allocation.amount_allocated),
  }));
}

async function getInvoiceNumbers(invoiceIds: string[]): Promise<Map<string, string>> {
  if (invoiceIds.length === 0) {
    return new Map();
  }

  const supabase = await createFinanceSupabaseClient();
  const { data } = await supabase.from("invoices").select("id, invoice_number").in("id", invoiceIds);

  return new Map(((data ?? []) as Array<{ id: string; invoice_number: string }>).map((invoice) => [invoice.id, invoice.invoice_number]));
}

export async function recordPayment(profile: UserProfile, input: PaymentFormInput): Promise<string> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase.rpc("record_payment_with_allocations", {
    p_payment_number: input.paymentNumber,
    p_parent_id: input.parentId,
    p_student_id: input.studentId,
    p_payment_date: input.paymentDate,
    p_amount: input.amount,
    p_payment_method: input.paymentMethod,
    p_reference_number: input.referenceNumber,
    p_notes: input.notes,
    p_allocations: input.allocations,
  });

  if (error) {
    console.error("[finance.recordPayment] record_payment_with_allocations failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      paymentMethod: input.paymentMethod,
      allocationCount: input.allocations.length,
      hasReferenceNumber: Boolean(input.referenceNumber),
      hasNotes: Boolean(input.notes),
    });

    throw new Error([error.code, error.message, error.details, error.hint].filter(Boolean).join(" | "));
  }

  return data as string;
}

export async function listFinanceParents(profile: UserProfile): Promise<FinanceOption[]> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase
    .from("parents")
    .select("id, full_name, phone")
    .is("deleted_at", null)
    .neq("status", "archived")
    .order("full_name", { ascending: true })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<{ id: string; full_name: string; phone: string }>).map((parent) => ({
    id: parent.id,
    label: parent.full_name,
    helper: parent.phone,
  }));
}

export async function listFinanceStudents(profile: UserProfile): Promise<FinanceOption[]> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createFinanceSupabaseClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, student_number")
    .is("deleted_at", null)
    .neq("status", "archived")
    .order("full_name", { ascending: true })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as StudentNameRow[]).map((student) => ({
    id: student.id,
    label: student.full_name,
    helper: student.student_number ?? "Student",
  }));
}

export async function listOutstandingInvoiceOptions(profile: UserProfile): Promise<FinanceOption[]> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const result = await listInvoices(profile, {
    query: "",
    status: "all",
    page: 1,
    pageSize: 100,
    sort: "due_date",
    direction: "asc",
  });

  return result.invoices
    .filter((invoice) => ["issued", "partially_paid"].includes(invoice.status) && invoice.balanceDue > 0)
    .map((invoice) => ({
      id: invoice.id,
      label: `${invoice.invoiceNumber} - ${invoice.parentName}`,
      helper: `${invoice.studentName} - ${invoice.balanceDue.toFixed(2)} outstanding`,
    }));
}

export async function getStudentBillingSummary(profile: UserProfile, studentId: string): Promise<BillingSummary | null> {
  if (!canManageFinance(profile)) {
    return null;
  }

  return getBillingSummary({ studentId });
}

export async function getParentBillingSummary(profile: UserProfile, parentId: string): Promise<BillingSummary | null> {
  if (!canManageFinance(profile)) {
    return null;
  }

  return getBillingSummary({ parentId });
}

async function getBillingSummary(filter: { studentId?: string; parentId?: string }): Promise<BillingSummary> {
  const supabase = await createFinanceSupabaseClient();
  let invoiceQuery = supabase
    .from("invoices")
    .select("id, invoice_number, parent_id, student_id, issue_date, due_date, subtotal, total, status, notes, created_at, updated_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filter.studentId) {
    invoiceQuery = invoiceQuery.eq("student_id", filter.studentId);
  }

  if (filter.parentId) {
    invoiceQuery = invoiceQuery.eq("parent_id", filter.parentId);
  }

  const { data: invoices } = await invoiceQuery.limit(20);
  const invoiceRows = (invoices ?? []) as InvoiceRow[];
  const paidMap = await getInvoicePaidMap(invoiceRows.map((invoice) => invoice.id));
  const outstanding = invoiceRows.reduce((sum, invoice) => sum + Math.max(toMoney(invoice.total) - (paidMap.get(invoice.id) ?? 0), 0), 0);

  let paymentQuery = supabase.from("payments").select("amount");

  if (filter.studentId) {
    paymentQuery = paymentQuery.eq("student_id", filter.studentId);
  }

  if (filter.parentId) {
    paymentQuery = paymentQuery.eq("parent_id", filter.parentId);
  }

  const { data: payments, count } = await paymentQuery;
  const paidTotal = ((payments ?? []) as Array<{ amount: number }>).reduce((sum, payment) => sum + toMoney(payment.amount), 0);

  return {
    invoiceCount: invoiceRows.length,
    paymentCount: count ?? (payments ?? []).length,
    outstandingBalance: roundMoney(outstanding),
    paidTotal: roundMoney(paidTotal),
    recentInvoices: invoiceRows.slice(0, 5).map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      dueDate: invoice.due_date,
      balanceDue: roundMoney(Math.max(toMoney(invoice.total) - (paidMap.get(invoice.id) ?? 0), 0)),
    })),
  };
}
