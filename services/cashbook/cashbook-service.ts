import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { CashbookExpenseFormInput, CashbookExpenseListQuery, CashbookIncomeFormInput, CashbookIncomeListQuery, CashbookPerformancePeriod, CashbookTargetFormInput, CashbookTargetListQuery } from "@/features/cashbook/schemas";
import type {
  CashbookExpenseDetail,
  CashbookExpenseListItem,
  CashbookExpenseListResult,
  CashbookExpenseSummary,
  CashbookBusinessAreaPerformanceItem,
  CashbookCashMovement,
  CashbookComparison,
  CashbookExpenseCategoryAnalysis,
  CashbookExpenseCategoryAnalysisItem,
  CashbookExecutiveSummaryMetric,
  CashbookIncomeDetail,
  CashbookIncomeListItem,
  CashbookIncomeListResult,
  CashbookIncomeSummary,
  CashbookManagementInsight,
  CashbookOption,
  CashbookPaymentMethodBreakdownItem,
  CashbookPerformanceDashboard,
  CashbookStudentKpis,
  CashbookTrendPoint,
  CashbookTargetDetail,
  CashbookTargetListItem,
  CashbookTargetListResult,
  CashbookTargetProgress,
} from "@/features/cashbook/types";
import { hasAnyPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";

type CashbookIncomeRow = {
  id: string;
  income_date: string;
  amount: number;
  income_category_id: string;
  business_area_id: string;
  payment_method: CashbookIncomeListItem["paymentMethod"];
  parent_id: string | null;
  student_id: string | null;
  description: string;
  notes: string | null;
  status: CashbookIncomeListItem["status"];
  recorded_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
};

type CashbookExpenseRow = {
  id: string;
  expense_date: string;
  amount: number;
  expense_category_id: string;
  business_area_id: string | null;
  supplier_or_staff_name: string | null;
  payment_method: CashbookExpenseListItem["paymentMethod"];
  description: string;
  notes: string | null;
  status: CashbookExpenseListItem["status"];
  recorded_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
};

type CashbookTargetRow = {
  id: string;
  branch_id: string | null;
  target_month: string;
  target_type: CashbookTargetListItem["targetType"];
  target_value: number;
  business_area_id: string | null;
  status: CashbookTargetListItem["status"];
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
};

type CashbookTargetProgressRow = {
  target_id: string;
  branch_id: string | null;
  target_month: string;
  target_type: CashbookTargetListItem["targetType"];
  target_value: number;
  current_value: number;
  remaining_value: number;
  percentage_achieved: number;
  days_remaining: number;
  projected_month_end_value: number;
  average_required_per_remaining_day: number;
  target_status: CashbookTargetProgress["targetStatus"];
  business_area_id: string | null;
  business_area_name: string | null;
};

type NameRow = {
  id: string;
  name?: string;
  full_name?: string;
  student_number?: string;
  code?: string;
};

type CashbookMutationError = {
  code?: string;
  message?: string;
} | null;

async function createCashbookSupabaseClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canViewCashbookIncome(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["cashbook.view.all", "cashbook.manage.all"]);
}

export function canCreateCashbookIncome(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["cashbook.create.all", "cashbook.manage.all"]);
}

export function canEditCashbookIncome(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["cashbook.edit.all", "cashbook.manage.all"]);
}

export function canVoidCashbookIncome(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["cashbook.void.all", "cashbook.manage.all"]);
}

export function canArchiveCashbookIncome(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["cashbook.archive.all", "cashbook.manage.all"]);
}

export function canViewCashbookExpenses(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["expenses.view.all", "expenses.manage.all"]);
}

export function canCreateCashbookExpenses(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["expenses.create.all", "expenses.manage.all"]);
}

export function canEditCashbookExpenses(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["expenses.edit.all", "expenses.manage.all"]);
}

export function canVoidCashbookExpenses(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["expenses.void.all", "expenses.manage.all"]);
}

export function canArchiveCashbookExpenses(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["expenses.archive.all", "expenses.manage.all"]);
}

export function canViewBusinessTargets(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["business_targets.view.all", "business_targets.manage.all", "business_performance.view.all"]);
}

export function canViewBusinessPerformance(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["business_performance.view.all"]);
}

export function canManageBusinessTargets(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["business_targets.manage.all"]);
}

function toMoney(value: unknown): number {
  return Math.round(Number(value ?? 0) * 100) / 100;
}

function formatOption(row: NameRow): CashbookOption {
  return {
    id: row.id,
    label: row.name ?? row.full_name ?? "Untitled",
    helper: row.code ?? row.student_number,
  };
}

function assertUpdatedRow(
  data: { id: string } | null,
  error: CashbookMutationError,
  emptyResultError: "income_not_found" | "income_not_editable" | "income_already_changed" | "expense_not_found" | "expense_not_editable" | "expense_already_changed" | "target_not_found" | "target_not_editable" | "target_already_changed",
): void {
  if (error?.code === "PGRST116") {
    throw new Error(emptyResultError);
  }

  if (error) {
    throw new Error("cashbook_mutation_failed");
  }

  if (!data?.id) {
    throw new Error(emptyResultError);
  }
}

async function getNameMap(table: string, ids: string[], select = "id, name"): Promise<Map<string, string>> {
  if (ids.length === 0) {
    return new Map();
  }

  const supabase = await createCashbookSupabaseClient();
  const { data } = await supabase.from(table).select(select).in("id", ids);

  return new Map(((data ?? []) as unknown as NameRow[]).map((row) => [row.id, row.name ?? row.full_name ?? "Unknown"]));
}

async function getSummary(supabase: SupabaseClient): Promise<CashbookIncomeSummary> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const { data, count, error } = await supabase
    .from("cashbook_income_entries")
    .select("income_date, amount", { count: "exact" })
    .eq("status", "recorded")
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<{ income_date: string; amount: number }>;

  return {
    todayIncome: toMoney(rows.filter((row) => row.income_date === today).reduce((sum, row) => sum + toMoney(row.amount), 0)),
    weekIncome: toMoney(rows.filter((row) => row.income_date >= weekStart.toISOString().slice(0, 10)).reduce((sum, row) => sum + toMoney(row.amount), 0)),
    monthIncome: toMoney(rows.filter((row) => row.income_date >= monthStart).reduce((sum, row) => sum + toMoney(row.amount), 0)),
    totalRecords: count ?? rows.length,
  };
}

async function mapIncomeRows(rows: CashbookIncomeRow[]): Promise<CashbookIncomeListItem[]> {
  const [
    areaNames,
    categoryNames,
    parentNames,
    studentNames,
    recordedByNames,
  ] = await Promise.all([
    getNameMap("business_areas", [...new Set(rows.map((row) => row.business_area_id))]),
    getNameMap("cashbook_income_categories", [...new Set(rows.map((row) => row.income_category_id))]),
    getNameMap("parents", [...new Set(rows.map((row) => row.parent_id).filter(Boolean) as string[])], "id, full_name"),
    getNameMap("students", [...new Set(rows.map((row) => row.student_id).filter(Boolean) as string[])], "id, full_name"),
    getNameMap("user_profiles", [...new Set(rows.map((row) => row.recorded_by))], "id, full_name"),
  ]);

  return rows.map((row) => ({
    id: row.id,
    incomeDate: row.income_date,
    amount: toMoney(row.amount),
    businessAreaId: row.business_area_id,
    businessAreaName: areaNames.get(row.business_area_id) ?? "Unknown area",
    incomeCategoryId: row.income_category_id,
    incomeCategoryName: categoryNames.get(row.income_category_id) ?? "Unknown category",
    paymentMethod: row.payment_method,
    parentId: row.parent_id,
    parentName: row.parent_id ? parentNames.get(row.parent_id) ?? "Unknown parent" : null,
    studentId: row.student_id,
    studentName: row.student_id ? studentNames.get(row.student_id) ?? "Unknown student" : null,
    description: row.description,
    notes: row.notes,
    status: row.status,
    recordedBy: row.recorded_by,
    recordedByName: recordedByNames.get(row.recorded_by) ?? "Unknown user",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    deletedBy: row.deleted_by,
  }));
}

export async function listCashbookIncome(profile: UserProfile, filters: CashbookIncomeListQuery): Promise<CashbookIncomeListResult> {
  noStore();

  if (!canViewCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("cashbook_income_entries")
    .select("id, income_date, amount, income_category_id, business_area_id, payment_method, parent_id, student_id, description, notes, status, recorded_by, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by", {
      count: "exact",
    });

  if (filters.status === "archived") {
    query = query.eq("status", "archived");
  } else if (filters.status !== "all") {
    query = query.eq("status", filters.status).is("deleted_at", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (filters.dateFrom) {
    query = query.gte("income_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("income_date", filters.dateTo);
  }

  if (filters.businessAreaId !== "all") {
    query = query.eq("business_area_id", filters.businessAreaId);
  }

  if (filters.incomeCategoryId !== "all") {
    query = query.eq("income_category_id", filters.incomeCategoryId);
  }

  if (filters.paymentMethod !== "all") {
    query = query.eq("payment_method", filters.paymentMethod);
  }

  if (filters.query) {
    query = query.ilike("description", `%${filters.query}%`);
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CashbookIncomeRow[];
  const [entries, summary] = await Promise.all([mapIncomeRows(rows), getSummary(supabase)]);

  return {
    entries,
    summary,
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getCashbookIncomeDetail(profile: UserProfile, incomeId: string): Promise<CashbookIncomeDetail | null> {
  noStore();

  if (!canViewCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_income_entries")
    .select("id, income_date, amount, income_category_id, business_area_id, payment_method, parent_id, student_id, description, notes, status, recorded_by, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by")
    .eq("id", incomeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [entry] = await mapIncomeRows([data as CashbookIncomeRow]);
  return entry;
}

export async function listCashbookBusinessAreas(profile: UserProfile): Promise<CashbookOption[]> {
  if (!canViewCashbookIncome(profile) && !canCreateCashbookIncome(profile) && !canViewCashbookExpenses(profile) && !canCreateCashbookExpenses(profile) && !canViewBusinessTargets(profile) && !canManageBusinessTargets(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("business_areas")
    .select("id, name, code")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NameRow[]).map(formatOption);
}

export async function listCashbookIncomeCategories(profile: UserProfile): Promise<CashbookOption[]> {
  if (!canViewCashbookIncome(profile) && !canCreateCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_income_categories")
    .select("id, name, code")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NameRow[]).map(formatOption);
}

export async function listCashbookExpenseCategories(profile: UserProfile): Promise<CashbookOption[]> {
  if (!canViewCashbookExpenses(profile) && !canCreateCashbookExpenses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_expense_categories")
    .select("id, name, code")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NameRow[]).map(formatOption);
}

export async function listCashbookParents(profile: UserProfile): Promise<CashbookOption[]> {
  if (!canCreateCashbookIncome(profile) && !canEditCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("parents")
    .select("id, full_name, phone")
    .is("deleted_at", null)
    .neq("status", "archived")
    .order("full_name", { ascending: true })
    .limit(250);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<NameRow & { phone?: string | null }>).map((parent) => ({
    id: parent.id,
    label: parent.full_name ?? "Parent",
    helper: parent.phone ?? undefined,
  }));
}

export async function listCashbookStudents(profile: UserProfile): Promise<CashbookOption[]> {
  if (!canCreateCashbookIncome(profile) && !canEditCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, student_number")
    .is("deleted_at", null)
    .neq("status", "archived")
    .order("full_name", { ascending: true })
    .limit(250);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NameRow[]).map(formatOption);
}

async function assertParentStudentRelationship(supabase: SupabaseClient, parentId: string | null, studentId: string | null): Promise<void> {
  if (!parentId || !studentId) {
    return;
  }

  const { data, error } = await supabase
    .from("parent_student_relationships")
    .select("id")
    .eq("parent_id", parentId)
    .eq("student_id", studentId)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    throw new Error("invalid_parent_student_relationship");
  }
}

export async function createCashbookIncome(profile: UserProfile, input: CashbookIncomeFormInput): Promise<string> {
  if (!canCreateCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  await assertParentStudentRelationship(supabase, input.parentId, input.studentId);

  const { data, error } = await supabase
    .from("cashbook_income_entries")
    .insert({
      income_date: input.incomeDate,
      amount: input.amount,
      business_area_id: input.businessAreaId,
      income_category_id: input.incomeCategoryId,
      payment_method: input.paymentMethod,
      parent_id: input.parentId,
      student_id: input.studentId,
      description: input.description,
      notes: input.notes,
      status: "recorded",
      recorded_by: profile.id,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (data as { id: string }).id;
}

export async function updateCashbookIncome(profile: UserProfile, incomeId: string, input: CashbookIncomeFormInput): Promise<void> {
  if (!canEditCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const existing = await getCashbookIncomeDetail(profile, incomeId);

  if (!existing || existing.status !== "recorded" || existing.deletedAt) {
    throw new Error("income_not_editable");
  }

  const supabase = await createCashbookSupabaseClient();
  await assertParentStudentRelationship(supabase, input.parentId, input.studentId);

  const { data, error } = await supabase
    .from("cashbook_income_entries")
    .update({
      income_date: input.incomeDate,
      amount: input.amount,
      business_area_id: input.businessAreaId,
      income_category_id: input.incomeCategoryId,
      payment_method: input.paymentMethod,
      parent_id: input.parentId,
      student_id: input.studentId,
      description: input.description,
      notes: input.notes,
      updated_by: profile.id,
    })
    .eq("id", incomeId)
    .eq("status", "recorded")
    .is("deleted_at", null)
    .select("id")
    .single();

  assertUpdatedRow(data as { id: string } | null, error, "income_already_changed");
}

export async function archiveCashbookIncome(profile: UserProfile, incomeId: string): Promise<void> {
  if (!canArchiveCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_income_entries")
    .update({
      status: "archived",
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
      updated_by: profile.id,
    })
    .eq("id", incomeId)
    .is("deleted_at", null)
    .select("id")
    .single();

  assertUpdatedRow(data as { id: string } | null, error, "income_already_changed");
}

export async function voidCashbookIncome(profile: UserProfile, incomeId: string): Promise<void> {
  if (!canVoidCashbookIncome(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_income_entries")
    .update({
      status: "void",
      updated_by: profile.id,
    })
    .eq("id", incomeId)
    .eq("status", "recorded")
    .is("deleted_at", null)
    .select("id")
    .single();

  assertUpdatedRow(data as { id: string } | null, error, "income_already_changed");
}

function buildExpenseDescription(input: CashbookExpenseFormInput, categoryName?: string): string {
  const category = categoryName?.trim() || "Expense";
  const supplier = input.supplierOrStaffName?.trim();
  const description = input.description?.trim();

  if (description) {
    return description;
  }

  return supplier ? `${category} - ${supplier}` : category;
}

async function getExpenseSummary(supabase: SupabaseClient): Promise<CashbookExpenseSummary> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const { data, count, error } = await supabase
    .from("cashbook_expense_entries")
    .select("expense_date, amount", { count: "exact" })
    .eq("status", "recorded")
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<{ expense_date: string; amount: number }>;

  return {
    todayExpenses: toMoney(rows.filter((row) => row.expense_date === today).reduce((sum, row) => sum + toMoney(row.amount), 0)),
    weekExpenses: toMoney(rows.filter((row) => row.expense_date >= weekStart.toISOString().slice(0, 10)).reduce((sum, row) => sum + toMoney(row.amount), 0)),
    monthExpenses: toMoney(rows.filter((row) => row.expense_date >= monthStart).reduce((sum, row) => sum + toMoney(row.amount), 0)),
    totalRecords: count ?? rows.length,
  };
}

async function mapExpenseRows(rows: CashbookExpenseRow[]): Promise<CashbookExpenseListItem[]> {
  const [
    areaNames,
    categoryNames,
    recordedByNames,
  ] = await Promise.all([
    getNameMap("business_areas", [...new Set(rows.map((row) => row.business_area_id).filter(Boolean) as string[])]),
    getNameMap("cashbook_expense_categories", [...new Set(rows.map((row) => row.expense_category_id))]),
    getNameMap("user_profiles", [...new Set(rows.map((row) => row.recorded_by))], "id, full_name"),
  ]);

  return rows.map((row) => ({
    id: row.id,
    expenseDate: row.expense_date,
    amount: toMoney(row.amount),
    expenseCategoryId: row.expense_category_id,
    expenseCategoryName: categoryNames.get(row.expense_category_id) ?? "Unknown category",
    businessAreaId: row.business_area_id,
    businessAreaName: row.business_area_id ? areaNames.get(row.business_area_id) ?? "Unknown area" : null,
    supplierOrStaffName: row.supplier_or_staff_name,
    paymentMethod: row.payment_method,
    description: row.description,
    notes: row.notes,
    status: row.status,
    recordedBy: row.recorded_by,
    recordedByName: recordedByNames.get(row.recorded_by) ?? "Unknown user",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    deletedBy: row.deleted_by,
  }));
}

export async function listCashbookExpenses(profile: UserProfile, filters: CashbookExpenseListQuery): Promise<CashbookExpenseListResult> {
  noStore();

  if (!canViewCashbookExpenses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("cashbook_expense_entries")
    .select("id, expense_date, amount, expense_category_id, business_area_id, supplier_or_staff_name, payment_method, description, notes, status, recorded_by, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by", {
      count: "exact",
    });

  if (filters.status === "archived") {
    query = query.eq("status", "archived");
  } else if (filters.status !== "all") {
    query = query.eq("status", filters.status).is("deleted_at", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (filters.dateFrom) {
    query = query.gte("expense_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("expense_date", filters.dateTo);
  }

  if (filters.businessAreaId !== "all") {
    query = query.eq("business_area_id", filters.businessAreaId);
  }

  if (filters.expenseCategoryId !== "all") {
    query = query.eq("expense_category_id", filters.expenseCategoryId);
  }

  if (filters.paymentMethod !== "all") {
    query = query.eq("payment_method", filters.paymentMethod);
  }

  if (filters.query) {
    query = query.or(`description.ilike.%${filters.query}%,supplier_or_staff_name.ilike.%${filters.query}%,notes.ilike.%${filters.query}%`);
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CashbookExpenseRow[];
  const [expenses, summary] = await Promise.all([mapExpenseRows(rows), getExpenseSummary(supabase)]);

  return {
    expenses,
    summary,
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getCashbookExpenseDetail(profile: UserProfile, expenseId: string): Promise<CashbookExpenseDetail | null> {
  noStore();

  if (!canViewCashbookExpenses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_expense_entries")
    .select("id, expense_date, amount, expense_category_id, business_area_id, supplier_or_staff_name, payment_method, description, notes, status, recorded_by, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by")
    .eq("id", expenseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [expense] = await mapExpenseRows([data as CashbookExpenseRow]);
  return expense;
}

async function getExpenseCategoryName(supabase: SupabaseClient, categoryId: string): Promise<string> {
  const { data, error } = await supabase
    .from("cashbook_expense_categories")
    .select("name")
    .eq("id", categoryId)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    throw new Error("invalid_expense_category");
  }

  return (data as { name: string }).name;
}

export async function createCashbookExpense(profile: UserProfile, input: CashbookExpenseFormInput): Promise<string> {
  if (!canCreateCashbookExpenses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const categoryName = await getExpenseCategoryName(supabase, input.expenseCategoryId);
  const description = buildExpenseDescription(input, categoryName);

  const { data, error } = await supabase
    .from("cashbook_expense_entries")
    .insert({
      expense_date: input.expenseDate,
      amount: input.amount,
      expense_category_id: input.expenseCategoryId,
      business_area_id: input.businessAreaId,
      supplier_or_staff_name: input.supplierOrStaffName,
      payment_method: input.paymentMethod,
      description,
      notes: input.notes,
      status: "recorded",
      recorded_by: profile.id,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("cashbook_expense_mutation_failed");
  }

  return (data as { id: string }).id;
}

export async function updateCashbookExpense(profile: UserProfile, expenseId: string, input: CashbookExpenseFormInput): Promise<void> {
  if (!canEditCashbookExpenses(profile)) {
    throw new Error("forbidden");
  }

  const existing = await getCashbookExpenseDetail(profile, expenseId);

  if (!existing || existing.status !== "recorded" || existing.deletedAt) {
    throw new Error("expense_not_editable");
  }

  const supabase = await createCashbookSupabaseClient();
  const categoryName = await getExpenseCategoryName(supabase, input.expenseCategoryId);
  const description = buildExpenseDescription(input, categoryName);

  const { data, error } = await supabase
    .from("cashbook_expense_entries")
    .update({
      expense_date: input.expenseDate,
      amount: input.amount,
      expense_category_id: input.expenseCategoryId,
      business_area_id: input.businessAreaId,
      supplier_or_staff_name: input.supplierOrStaffName,
      payment_method: input.paymentMethod,
      description,
      notes: input.notes,
      updated_by: profile.id,
    })
    .eq("id", expenseId)
    .eq("status", "recorded")
    .is("deleted_at", null)
    .select("id")
    .single();

  assertUpdatedRow(data as { id: string } | null, error, "expense_already_changed");
}

export async function archiveCashbookExpense(profile: UserProfile, expenseId: string): Promise<void> {
  if (!canArchiveCashbookExpenses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_expense_entries")
    .update({
      status: "archived",
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
      updated_by: profile.id,
    })
    .eq("id", expenseId)
    .is("deleted_at", null)
    .select("id")
    .single();

  assertUpdatedRow(data as { id: string } | null, error, "expense_already_changed");
}

export async function voidCashbookExpense(profile: UserProfile, expenseId: string): Promise<void> {
  if (!canVoidCashbookExpenses(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_expense_entries")
    .update({
      status: "void",
      updated_by: profile.id,
    })
    .eq("id", expenseId)
    .eq("status", "recorded")
    .is("deleted_at", null)
    .select("id")
    .single();

  assertUpdatedRow(data as { id: string } | null, error, "expense_already_changed");
}

function mapTargetProgressRow(row: CashbookTargetProgressRow): CashbookTargetProgress {
  return {
    targetId: row.target_id,
    branchId: row.branch_id,
    targetMonth: row.target_month,
    targetType: row.target_type,
    targetValue: toMoney(row.target_value),
    currentValue: toMoney(row.current_value),
    remainingValue: toMoney(row.remaining_value),
    percentageAchieved: toMoney(row.percentage_achieved),
    daysRemaining: Number(row.days_remaining ?? 0),
    projectedMonthEndValue: toMoney(row.projected_month_end_value),
    averageRequiredPerRemainingDay: toMoney(row.average_required_per_remaining_day),
    targetStatus: row.target_status,
    businessAreaId: row.business_area_id,
    businessAreaName: row.business_area_name,
  };
}

function fallbackProgress(row: CashbookTargetRow): CashbookTargetProgress {
  return {
    targetId: row.id,
    branchId: row.branch_id,
    targetMonth: row.target_month,
    targetType: row.target_type,
    targetValue: toMoney(row.target_value),
    currentValue: 0,
    remainingValue: toMoney(row.target_value),
    percentageAchieved: 0,
    daysRemaining: 0,
    projectedMonthEndValue: 0,
    averageRequiredPerRemainingDay: 0,
    targetStatus: "On Track",
    businessAreaId: row.business_area_id,
    businessAreaName: null,
  };
}

async function getTargetProgressMap(targetIds: string[]): Promise<Map<string, CashbookTargetProgress>> {
  if (targetIds.length === 0) {
    return new Map();
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_target_progress_view")
    .select("target_id, branch_id, target_month, target_type, target_value, current_value, remaining_value, percentage_achieved, days_remaining, projected_month_end_value, average_required_per_remaining_day, target_status, business_area_id, business_area_name")
    .in("target_id", targetIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(((data ?? []) as CashbookTargetProgressRow[]).map((row) => [row.target_id, mapTargetProgressRow(row)]));
}

async function mapTargetRows(rows: CashbookTargetRow[]): Promise<CashbookTargetListItem[]> {
  const [progressMap, areaNames] = await Promise.all([
    getTargetProgressMap(rows.filter((row) => row.status === "active" && !row.deleted_at).map((row) => row.id)),
    getNameMap("business_areas", [...new Set(rows.map((row) => row.business_area_id).filter(Boolean) as string[])]),
  ]);

  return rows.map((row) => {
    const progress = progressMap.get(row.id) ?? fallbackProgress(row);

    return {
      ...progress,
      id: row.id,
      targetId: row.id,
      businessAreaName: progress.businessAreaName ?? (row.business_area_id ? areaNames.get(row.business_area_id) ?? "Unknown area" : null),
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      deletedBy: row.deleted_by,
    };
  });
}

function currentMonthStart(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

export async function listCashbookTargets(profile: UserProfile, filters: CashbookTargetListQuery): Promise<CashbookTargetListResult> {
  noStore();

  if (!canViewBusinessTargets(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("monthly_business_targets")
    .select("id, branch_id, target_month, target_type, target_value, business_area_id, status, notes, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by", {
      count: "exact",
    });

  if (filters.status === "archived") {
    query = query.eq("status", "archived");
  } else if (filters.status !== "all") {
    query = query.eq("status", filters.status).is("deleted_at", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (filters.targetMonth) {
    query = query.eq("target_month", filters.targetMonth);
  }

  if (filters.targetType !== "all") {
    query = query.eq("target_type", filters.targetType);
  }

  if (filters.businessAreaId !== "all") {
    query = filters.businessAreaId === "none" ? query.is("business_area_id", null) : query.eq("business_area_id", filters.businessAreaId);
  }

  if (filters.query) {
    query = query.ilike("notes", `%${filters.query}%`);
  }

  const { data, error, count } = await query.order(filters.sort, { ascending: filters.direction === "asc" }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CashbookTargetRow[];
  const [targets, progressCards] = await Promise.all([
    mapTargetRows(rows),
    listCurrentMonthTargetProgress(profile),
  ]);

  return {
    targets,
    progressCards,
    totalRecords: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / filters.pageSize),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function listCurrentMonthTargetProgress(profile: UserProfile): Promise<CashbookTargetProgress[]> {
  noStore();

  if (!canViewBusinessTargets(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("cashbook_target_progress_view")
    .select("target_id, branch_id, target_month, target_type, target_value, current_value, remaining_value, percentage_achieved, days_remaining, projected_month_end_value, average_required_per_remaining_day, target_status, business_area_id, business_area_name")
    .eq("target_month", currentMonthStart())
    .is("business_area_id", null)
    .order("target_type", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CashbookTargetProgressRow[]).map(mapTargetProgressRow);
}

export async function getCashbookTargetDetail(profile: UserProfile, targetId: string): Promise<CashbookTargetDetail | null> {
  noStore();

  if (!canViewBusinessTargets(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("monthly_business_targets")
    .select("id, branch_id, target_month, target_type, target_value, business_area_id, status, notes, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by")
    .eq("id", targetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [target] = await mapTargetRows([data as CashbookTargetRow]);
  return target;
}

async function assertUniqueActiveTarget(supabase: SupabaseClient, input: CashbookTargetFormInput, excludeTargetId?: string): Promise<void> {
  let query = supabase
    .from("monthly_business_targets")
    .select("id")
    .eq("target_month", input.targetMonth)
    .eq("target_type", input.targetType)
    .eq("status", "active")
    .is("deleted_at", null);

  query = input.businessAreaId ? query.eq("business_area_id", input.businessAreaId) : query.is("business_area_id", null);

  if (excludeTargetId) {
    query = query.neq("id", excludeTargetId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw new Error("target_mutation_failed");
  }

  if ((data ?? []).length > 0) {
    throw new Error("duplicate_active_target");
  }
}

export async function createCashbookTarget(profile: UserProfile, input: CashbookTargetFormInput): Promise<string> {
  if (!canManageBusinessTargets(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  await assertUniqueActiveTarget(supabase, input);

  const { data, error } = await supabase
    .from("monthly_business_targets")
    .insert({
      target_month: input.targetMonth,
      target_type: input.targetType,
      target_value: input.targetValue,
      business_area_id: input.businessAreaId,
      notes: input.notes,
      status: "active",
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "duplicate_active_target" : "target_mutation_failed");
  }

  return (data as { id: string }).id;
}

export async function updateCashbookTarget(profile: UserProfile, targetId: string, input: CashbookTargetFormInput): Promise<void> {
  if (!canManageBusinessTargets(profile)) {
    throw new Error("forbidden");
  }

  const existing = await getCashbookTargetDetail(profile, targetId);

  if (!existing || existing.status !== "active" || existing.deletedAt) {
    throw new Error("target_not_editable");
  }

  const supabase = await createCashbookSupabaseClient();
  await assertUniqueActiveTarget(supabase, input, targetId);

  const { data, error } = await supabase
    .from("monthly_business_targets")
    .update({
      target_month: input.targetMonth,
      target_type: input.targetType,
      target_value: input.targetValue,
      business_area_id: input.businessAreaId,
      notes: input.notes,
      updated_by: profile.id,
    })
    .eq("id", targetId)
    .eq("status", "active")
    .is("deleted_at", null)
    .select("id")
    .single();

  if (error?.code === "23505") {
    throw new Error("duplicate_active_target");
  }

  assertUpdatedRow(data as { id: string } | null, error, "target_already_changed");
}

export async function archiveCashbookTarget(profile: UserProfile, targetId: string): Promise<void> {
  if (!canManageBusinessTargets(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const { data, error } = await supabase
    .from("monthly_business_targets")
    .update({
      status: "archived",
      deleted_at: new Date().toISOString(),
      deleted_by: profile.id,
      updated_by: profile.id,
    })
    .eq("id", targetId)
    .eq("status", "active")
    .is("deleted_at", null)
    .select("id")
    .single();

  assertUpdatedRow(data as { id: string } | null, error, "target_already_changed");
}

type DateRange = {
  start: string;
  end: string;
};

type PeriodDefinition = {
  current: DateRange;
  previous: DateRange;
  label: string;
};

type SummaryTotals = {
  invoicePaymentTotal: number;
  cashbookIncomeTotal: number;
  totalIncome: number;
  expenseTotal: number;
  netProfit: number;
};

type DailySummaryRow = {
  summary_date: string;
  invoice_payment_total: number;
  cashbook_income_total: number;
  total_income: number;
  expense_total: number;
  net_profit: number;
};

type MonthlySummaryRow = {
  summary_month: string;
  invoice_payment_total: number;
  cashbook_income_total: number;
  total_income: number;
  expense_total: number;
  net_profit: number;
};

type PaymentRow = {
  payment_date: string;
  amount: number;
  payment_method: string;
};

type PerformanceIncomeRow = {
  income_date: string;
  amount: number;
  payment_method: string;
  business_area_id: string;
};

type PerformanceExpenseRow = {
  expense_date: string;
  amount: number;
  payment_method: string;
  business_area_id: string | null;
  expense_category_id: string;
};

type OutstandingInvoiceRow = {
  id: string;
  invoice_number: string;
  total: number;
  due_date: string;
};

type PaymentAllocationRow = {
  invoice_id: string;
  amount_allocated: number;
};

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function monthRange(year: number, monthIndex: number): DateRange {
  return {
    start: localDateString(new Date(year, monthIndex, 1)),
    end: localDateString(new Date(year, monthIndex + 1, 0)),
  };
}

function getPeriodDefinition(period: CashbookPerformancePeriod): PeriodDefinition {
  const now = new Date();

  if (period === "today") {
    const today = localDateString(now);
    const yesterday = localDateString(addDays(now, -1));
    return {
      current: { start: today, end: today },
      previous: { start: yesterday, end: yesterday },
      label: "Today",
    };
  }

  if (period === "week") {
    const weekStart = startOfWeek(now);
    const previousWeekStart = addDays(weekStart, -7);
    return {
      current: { start: localDateString(weekStart), end: localDateString(addDays(weekStart, 6)) },
      previous: { start: localDateString(previousWeekStart), end: localDateString(addDays(previousWeekStart, 6)) },
      label: "This Week",
    };
  }

  if (period === "year") {
    return {
      current: { start: localDateString(new Date(now.getFullYear(), 0, 1)), end: localDateString(new Date(now.getFullYear(), 11, 31)) },
      previous: { start: localDateString(new Date(now.getFullYear() - 1, 0, 1)), end: localDateString(new Date(now.getFullYear() - 1, 11, 31)) },
      label: "This Year",
    };
  }

  const currentMonth = monthRange(now.getFullYear(), now.getMonth());
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return {
    current: currentMonth,
    previous: monthRange(previousMonthDate.getFullYear(), previousMonthDate.getMonth()),
    label: "This Month",
  };
}

function emptySummaryTotals(): SummaryTotals {
  return {
    invoicePaymentTotal: 0,
    cashbookIncomeTotal: 0,
    totalIncome: 0,
    expenseTotal: 0,
    netProfit: 0,
  };
}

function aggregateSummaryRows(rows: Array<DailySummaryRow | MonthlySummaryRow>): SummaryTotals {
  return rows.reduce((totals, row) => ({
    invoicePaymentTotal: toMoney(totals.invoicePaymentTotal + toMoney(row.invoice_payment_total)),
    cashbookIncomeTotal: toMoney(totals.cashbookIncomeTotal + toMoney(row.cashbook_income_total)),
    totalIncome: toMoney(totals.totalIncome + toMoney(row.total_income)),
    expenseTotal: toMoney(totals.expenseTotal + toMoney(row.expense_total)),
    netProfit: toMoney(totals.netProfit + toMoney(row.net_profit)),
  }), emptySummaryTotals());
}

function buildComparison(current: number, previous: number): CashbookComparison {
  const difference = toMoney(current - previous);

  if (previous === 0) {
    return {
      difference,
      percentChange: null,
      isNeutral: true,
      label: "No previous period",
    };
  }

  const percentChange = toMoney((difference / Math.abs(previous)) * 100);
  const direction = difference >= 0 ? "up" : "down";

  return {
    difference,
    percentChange,
    isNeutral: false,
    label: `${Math.abs(percentChange)}% ${direction}`,
  };
}

function buildSummaryCard(
  id: CashbookExecutiveSummaryMetric["id"],
  label: string,
  value: number,
  previousValue: number,
  helper: string,
  tone: CashbookExecutiveSummaryMetric["tone"],
  valueType: CashbookExecutiveSummaryMetric["valueType"] = "money",
): CashbookExecutiveSummaryMetric {
  return {
    id,
    label,
    value: toMoney(value),
    valueType,
    helper,
    comparison: buildComparison(value, previousValue),
    tone,
  };
}

async function getSummaryRows(supabase: SupabaseClient, range: DateRange): Promise<DailySummaryRow[]> {
  const { data, error } = await supabase
    .from("cashbook_daily_summary_view")
    .select("summary_date, invoice_payment_total, cashbook_income_total, total_income, expense_total, net_profit")
    .gte("summary_date", range.start)
    .lte("summary_date", range.end)
    .order("summary_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DailySummaryRow[];
}

async function getMonthlySummaryRows(supabase: SupabaseClient, range: DateRange): Promise<MonthlySummaryRow[]> {
  const { data, error } = await supabase
    .from("cashbook_monthly_summary_view")
    .select("summary_month, invoice_payment_total, cashbook_income_total, total_income, expense_total, net_profit")
    .gte("summary_month", range.start)
    .lte("summary_month", range.end)
    .order("summary_month", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MonthlySummaryRow[];
}

function formatTrendLabel(dateString: string, period: CashbookPerformancePeriod): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day ?? 1);

  if (period === "year") {
    return date.toLocaleDateString("en-GB", { month: "short" });
  }

  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function mapTrendRows(rows: Array<DailySummaryRow | MonthlySummaryRow>, period: CashbookPerformancePeriod): CashbookTrendPoint[] {
  return rows.map((row) => {
    const date = "summary_month" in row ? row.summary_month : row.summary_date;

    return {
      label: formatTrendLabel(date, period),
      date,
      totalIncome: toMoney(row.total_income),
      expenses: toMoney(row.expense_total),
      netProfit: toMoney(row.net_profit),
    };
  });
}

async function getOutstandingInvoiceSummary(supabase: SupabaseClient): Promise<{ summary: CashbookPerformanceDashboard["outstandingInvoices"]; totalForComparison: number }> {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, total, due_date")
    .in("status", ["issued", "partially_paid"])
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const invoiceRows = (invoices ?? []) as OutstandingInvoiceRow[];
  const invoiceIds = invoiceRows.map((invoice) => invoice.id);

  let allocations: PaymentAllocationRow[] = [];
  if (invoiceIds.length > 0) {
    const { data: allocationData, error: allocationError } = await supabase
      .from("payment_allocations")
      .select("invoice_id, amount_allocated")
      .in("invoice_id", invoiceIds);

    if (allocationError) {
      throw new Error(allocationError.message);
    }

    allocations = (allocationData ?? []) as PaymentAllocationRow[];
  }

  const paidByInvoice = new Map<string, number>();
  allocations.forEach((allocation) => {
    paidByInvoice.set(allocation.invoice_id, toMoney((paidByInvoice.get(allocation.invoice_id) ?? 0) + toMoney(allocation.amount_allocated)));
  });

  const today = new Date();
  const outstandingRows = invoiceRows.map((invoice) => ({
    ...invoice,
    balance: Math.max(toMoney(invoice.total) - (paidByInvoice.get(invoice.id) ?? 0), 0),
  })).filter((invoice) => invoice.balance > 0);

  const oldestOutstandingInvoiceAgeDays = outstandingRows.length > 0
    ? Math.max(...outstandingRows.map((invoice) => {
      const [year, month, day] = invoice.due_date.split("-").map(Number);
      const dueDate = new Date(year, month - 1, day);
      return Math.max(Math.floor((today.getTime() - dueDate.getTime()) / 86400000), 0);
    }))
    : null;

  const totalOutstanding = toMoney(outstandingRows.reduce((sum, invoice) => sum + invoice.balance, 0));

  return {
    summary: {
      totalOutstanding,
      unpaidInvoiceCount: outstandingRows.length,
      oldestOutstandingInvoiceAgeDays,
    },
    totalForComparison: totalOutstanding,
  };
}

async function getPerformanceIncomeRows(supabase: SupabaseClient, range: DateRange): Promise<PerformanceIncomeRow[]> {
  const { data, error } = await supabase
    .from("cashbook_income_entries")
    .select("income_date, amount, payment_method, business_area_id")
    .eq("status", "recorded")
    .is("deleted_at", null)
    .gte("income_date", range.start)
    .lte("income_date", range.end);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PerformanceIncomeRow[];
}

async function getPerformanceExpenseRows(supabase: SupabaseClient, range: DateRange): Promise<PerformanceExpenseRow[]> {
  const { data, error } = await supabase
    .from("cashbook_expense_entries")
    .select("expense_date, amount, payment_method, business_area_id, expense_category_id")
    .eq("status", "recorded")
    .is("deleted_at", null)
    .gte("expense_date", range.start)
    .lte("expense_date", range.end);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PerformanceExpenseRow[];
}

async function getPaymentRows(supabase: SupabaseClient, range: DateRange): Promise<PaymentRow[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("payment_date, amount, payment_method")
    .gte("payment_date", range.start)
    .lte("payment_date", range.end);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PaymentRow[];
}

function normalizePaymentMethod(method: string): CashbookPaymentMethodBreakdownItem["method"] {
  return method === "cash" || method === "bank_transfer" || method === "cheque" ? method : "other";
}

function paymentMethodLabel(method: CashbookPaymentMethodBreakdownItem["method"]): string {
  const labels: Record<CashbookPaymentMethodBreakdownItem["method"], string> = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
    other: "Other",
  };

  return labels[method];
}

async function getPaymentMethodBreakdownData(supabase: SupabaseClient, range: DateRange): Promise<{ paymentMethods: CashbookPaymentMethodBreakdownItem[]; cashMovement: CashbookCashMovement }> {
  const [payments, incomeRows, expenseRows] = await Promise.all([
    getPaymentRows(supabase, range),
    getPerformanceIncomeRows(supabase, range),
    getPerformanceExpenseRows(supabase, range),
  ]);
  const byMethod = new Map<CashbookPaymentMethodBreakdownItem["method"], CashbookPaymentMethodBreakdownItem>();

  function ensureMethod(method: CashbookPaymentMethodBreakdownItem["method"]): CashbookPaymentMethodBreakdownItem {
    const existing = byMethod.get(method);
    if (existing) {
      return existing;
    }

    const next = {
      method,
      label: paymentMethodLabel(method),
      invoicePaymentIncome: 0,
      cashbookIncome: 0,
      expenseOutflow: 0,
      netMovement: 0,
    };
    byMethod.set(method, next);
    return next;
  }

  ["cash", "bank_transfer", "cheque"].forEach((method) => ensureMethod(method as CashbookPaymentMethodBreakdownItem["method"]));

  payments.forEach((payment) => {
    const item = ensureMethod(normalizePaymentMethod(payment.payment_method));
    item.invoicePaymentIncome = toMoney(item.invoicePaymentIncome + toMoney(payment.amount));
  });

  incomeRows.forEach((income) => {
    const item = ensureMethod(normalizePaymentMethod(income.payment_method));
    item.cashbookIncome = toMoney(item.cashbookIncome + toMoney(income.amount));
  });

  expenseRows.forEach((expense) => {
    const item = ensureMethod(normalizePaymentMethod(expense.payment_method));
    item.expenseOutflow = toMoney(item.expenseOutflow + toMoney(expense.amount));
  });

  const paymentMethods = Array.from(byMethod.values())
    .map((item) => ({
      ...item,
      netMovement: toMoney(item.invoicePaymentIncome + item.cashbookIncome - item.expenseOutflow),
    }))
    .filter((item) => item.method !== "other" || item.invoicePaymentIncome > 0 || item.cashbookIncome > 0 || item.expenseOutflow > 0);

  const cash = paymentMethods.find((item) => item.method === "cash");

  return {
    paymentMethods,
    cashMovement: {
      cashReceived: toMoney((cash?.invoicePaymentIncome ?? 0) + (cash?.cashbookIncome ?? 0)),
      cashExpenses: toMoney(cash?.expenseOutflow ?? 0),
      netCashMovement: toMoney((cash?.invoicePaymentIncome ?? 0) + (cash?.cashbookIncome ?? 0) - (cash?.expenseOutflow ?? 0)),
    },
  };
}

async function getBusinessAreaPerformanceData(
  supabase: SupabaseClient,
  range: DateRange,
  totalIncome: number,
  invoicePaymentTotal: number,
  targets: CashbookTargetProgress[],
): Promise<CashbookBusinessAreaPerformanceItem[]> {
  const [incomeRows, expenseRows, areas] = await Promise.all([
    getPerformanceIncomeRows(supabase, range),
    getPerformanceExpenseRows(supabase, range),
    supabase
      .from("business_areas")
      .select("id, name")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
  ]);

  if (areas.error) {
    throw new Error(areas.error.message);
  }

  const areaNames = new Map(((areas.data ?? []) as NameRow[]).map((area) => [area.id, area.name ?? "Business area"]));
  const rows = new Map<string, CashbookBusinessAreaPerformanceItem>();

  function ensureArea(id: string, name: string): CashbookBusinessAreaPerformanceItem {
    const existing = rows.get(id);
    if (existing) {
      return existing;
    }

    const targetStatus = targets.find((target) => target.businessAreaId === id)?.targetStatus ?? "Not set";
    const next: CashbookBusinessAreaPerformanceItem = {
      id,
      name,
      income: 0,
      expenses: 0,
      profit: 0,
      profitMargin: null,
      shareOfTotalIncome: 0,
      targetStatus,
    };
    rows.set(id, next);
    return next;
  }

  incomeRows.forEach((income) => {
    const item = ensureArea(income.business_area_id, areaNames.get(income.business_area_id) ?? "Unknown area");
    item.income = toMoney(item.income + toMoney(income.amount));
  });

  expenseRows.forEach((expense) => {
    const areaId = expense.business_area_id ?? "unassigned_expenses";
    const item = ensureArea(areaId, expense.business_area_id ? areaNames.get(expense.business_area_id) ?? "Unknown area" : "Unassigned Expenses");
    item.expenses = toMoney(item.expenses + toMoney(expense.amount));
  });

  if (invoicePaymentTotal > 0) {
    const item = ensureArea("invoice_income_unassigned", "Invoice Income / Unassigned");
    item.income = toMoney(item.income + invoicePaymentTotal);
  }

  return Array.from(rows.values())
    .map((item) => {
      const profit = toMoney(item.income - item.expenses);
      return {
        ...item,
        profit,
        profitMargin: item.income > 0 ? toMoney((profit / item.income) * 100) : null,
        shareOfTotalIncome: totalIncome > 0 ? toMoney((item.income / totalIncome) * 100) : 0,
      };
    })
    .sort((a, b) => b.income - a.income);
}

async function getExpenseCategoryAnalysisData(supabase: SupabaseClient, range: DateRange): Promise<CashbookExpenseCategoryAnalysis> {
  const [expenseRows, categories] = await Promise.all([
    getPerformanceExpenseRows(supabase, range),
    supabase
      .from("cashbook_expense_categories")
      .select("id, name, code")
      .is("deleted_at", null),
  ]);

  if (categories.error) {
    throw new Error(categories.error.message);
  }

  const categoryNames = new Map(((categories.data ?? []) as NameRow[]).map((category) => [category.id, category.name ?? "Expense category"]));
  const categoryCodes = new Map(((categories.data ?? []) as NameRow[]).map((category) => [category.id, category.code ?? ""]));
  const totals = new Map<string, number>();

  expenseRows.forEach((expense) => {
    totals.set(expense.expense_category_id, toMoney((totals.get(expense.expense_category_id) ?? 0) + toMoney(expense.amount)));
  });

  const totalExpenses = toMoney(Array.from(totals.values()).reduce((sum, amount) => sum + amount, 0));
  const categoryItems: CashbookExpenseCategoryAnalysisItem[] = Array.from(totals.entries())
    .map(([id, total]) => ({
      id,
      name: categoryNames.get(id) ?? "Unknown category",
      total,
      percentOfExpenses: totalExpenses > 0 ? toMoney((total / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
  const salaryTotal = toMoney(expenseRows
    .filter((expense) => {
      const name = (categoryNames.get(expense.expense_category_id) ?? "").toLowerCase();
      const code = (categoryCodes.get(expense.expense_category_id) ?? "").toLowerCase();
      return name.includes("salary") || name.includes("salaries") || code.includes("salary");
    })
    .reduce((sum, expense) => sum + toMoney(expense.amount), 0));

  return {
    totalExpenses,
    largestCategory: categoryItems[0] ?? null,
    salaryTotal,
    categories: categoryItems,
  };
}

async function getStudentKpis(supabase: SupabaseClient): Promise<CashbookStudentKpis> {
  const monthStart = currentMonthStart();
  const [
    activeResult,
    newActiveResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null)
      .gte("created_at", `${monthStart}T00:00:00`),
  ]);

  if (activeResult.error) {
    throw new Error(activeResult.error.message);
  }

  if (newActiveResult.error) {
    throw new Error(newActiveResult.error.message);
  }

  return {
    activeStudents: activeResult.count ?? 0,
    newActiveStudentsThisMonth: newActiveResult.count ?? 0,
    archivedOrInactiveThisMonth: null,
    limitation: "Archived or inactivated student counts are deferred until a reliable status-change reporting view is introduced.",
  };
}

function buildInsights(
  summary: SummaryTotals,
  previousSummary: SummaryTotals,
  businessAreas: CashbookBusinessAreaPerformanceItem[],
  expenseAnalysis: CashbookExpenseCategoryAnalysis,
  targets: CashbookTargetProgress[],
  outstandingInvoices: CashbookPerformanceDashboard["outstandingInvoices"],
): CashbookManagementInsight[] {
  const insights: CashbookManagementInsight[] = [];
  const bestArea = businessAreas.filter((area) => area.id !== "unassigned_expenses").sort((a, b) => b.profit - a.profit)[0];
  const revenueTarget = targets.find((target) => target.targetType === "revenue" && !target.businessAreaId);
  const profitTarget = targets.find((target) => target.targetType === "profit" && !target.businessAreaId);

  if (bestArea) {
    insights.push({
      title: "Best-performing area",
      detail: `${bestArea.name} leads this period with ${toMoney(bestArea.profit).toLocaleString("en-GB")} MAD net profit based on recorded income and tagged expenses.`,
      tone: "sage",
    });
  }

  if (expenseAnalysis.largestCategory) {
    insights.push({
      title: "Largest expense category",
      detail: `${expenseAnalysis.largestCategory.name} is the largest category at ${toMoney(expenseAnalysis.largestCategory.total).toLocaleString("en-GB")} MAD, representing ${expenseAnalysis.largestCategory.percentOfExpenses}% of recorded expenses.`,
      tone: "yellow",
    });
  }

  const incomeComparison = buildComparison(summary.totalIncome, previousSummary.totalIncome);
  insights.push({
    title: "Income movement",
    detail: incomeComparison.isNeutral ? "No previous-period income is available for comparison." : `Total income is ${incomeComparison.label} compared with the previous period.`,
    tone: summary.totalIncome >= previousSummary.totalIncome ? "sage" : "coral",
  });

  const profitComparison = buildComparison(summary.netProfit, previousSummary.netProfit);
  insights.push({
    title: "Profit movement",
    detail: profitComparison.isNeutral ? "No previous-period profit is available for comparison." : `Net profit is ${profitComparison.label} compared with the previous period.`,
    tone: summary.netProfit >= previousSummary.netProfit ? "sage" : "coral",
  });

  if (revenueTarget) {
    insights.push({
      title: "Revenue run-rate",
      detail: `Revenue is projected at ${toMoney(revenueTarget.projectedMonthEndValue).toLocaleString("en-GB")} MAD with ${toMoney(revenueTarget.averageRequiredPerRemainingDay).toLocaleString("en-GB")} MAD average required per remaining day.`,
      tone: "navy",
    });
  }

  if (profitTarget) {
    insights.push({
      title: "Profit projection",
      detail: `Profit is projected at ${toMoney(profitTarget.projectedMonthEndValue).toLocaleString("en-GB")} MAD based on the current monthly target view.`,
      tone: profitTarget.projectedMonthEndValue >= profitTarget.targetValue ? "sage" : "yellow",
    });
  }

  if (outstandingInvoices.totalOutstanding > 0) {
    insights.push({
      title: "Outstanding invoice watch",
      detail: `${outstandingInvoices.unpaidInvoiceCount} invoice(s) remain outstanding, totalling ${toMoney(outstandingInvoices.totalOutstanding).toLocaleString("en-GB")} MAD.`,
      tone: "coral",
    });
  }

  return insights.slice(0, 7);
}

export async function getBusinessPerformanceDashboard(profile: UserProfile, period: CashbookPerformancePeriod): Promise<CashbookPerformanceDashboard> {
  noStore();

  if (!canViewBusinessPerformance(profile)) {
    throw new Error("forbidden");
  }

  const supabase = await createCashbookSupabaseClient();
  const definition = getPeriodDefinition(period);
  const [
    currentDailyRows,
    previousDailyRows,
    trendRows,
    targets,
    outstandingResult,
    studentKpis,
  ] = await Promise.all([
    getSummaryRows(supabase, definition.current),
    getSummaryRows(supabase, definition.previous),
    period === "year" ? getMonthlySummaryRows(supabase, definition.current) : getSummaryRows(supabase, definition.current),
    listCurrentMonthTargetProgress(profile),
    getOutstandingInvoiceSummary(supabase),
    getStudentKpis(supabase),
  ]);
  const currentSummary = aggregateSummaryRows(currentDailyRows);
  const previousSummary = aggregateSummaryRows(previousDailyRows);
  const profitMargin = currentSummary.totalIncome > 0 ? toMoney((currentSummary.netProfit / currentSummary.totalIncome) * 100) : 0;
  const previousProfitMargin = previousSummary.totalIncome > 0 ? toMoney((previousSummary.netProfit / previousSummary.totalIncome) * 100) : 0;
  const [
    businessAreas,
    expenseAnalysis,
    paymentBreakdown,
  ] = await Promise.all([
    getBusinessAreaPerformanceData(supabase, definition.current, currentSummary.totalIncome, currentSummary.invoicePaymentTotal, targets),
    getExpenseCategoryAnalysisData(supabase, definition.current),
    getPaymentMethodBreakdownData(supabase, definition.current),
  ]);
  const summaryCards: CashbookExecutiveSummaryMetric[] = [
    buildSummaryCard("invoice_payments", "Invoice Payments Received", currentSummary.invoicePaymentTotal, previousSummary.invoicePaymentTotal, "Received invoice payments only", "sage"),
    buildSummaryCard("cashbook_income", "Cashbook Income", currentSummary.cashbookIncomeTotal, previousSummary.cashbookIncomeTotal, "Daily income outside invoices", "coral"),
    buildSummaryCard("total_income", "Total Income", currentSummary.totalIncome, previousSummary.totalIncome, "Payments received plus cashbook income", "navy"),
    buildSummaryCard("expenses", "Expenses", currentSummary.expenseTotal, previousSummary.expenseTotal, "Recorded expenses only", "yellow"),
    buildSummaryCard("net_profit", "Net Profit", currentSummary.netProfit, previousSummary.netProfit, "Total income minus expenses", currentSummary.netProfit >= 0 ? "sage" : "coral"),
    buildSummaryCard("outstanding_invoices", "Outstanding Invoices", outstandingResult.summary.totalOutstanding, 0, `${outstandingResult.summary.unpaidInvoiceCount} unpaid invoice(s)`, "coral"),
    buildSummaryCard("profit_margin", "Profit Margin", profitMargin, previousProfitMargin, "Net profit divided by total income", "navy", "percent"),
  ];

  return {
    period,
    periodLabel: definition.label,
    currentRange: definition.current,
    previousRange: definition.previous,
    summaryCards,
    outstandingInvoices: outstandingResult.summary,
    todayBusinessGoal: {
      revenueTarget: targets.find((target) => target.targetType === "revenue" && !target.businessAreaId) ?? null,
    },
    monthlyTargets: targets,
    studentKpis,
    trends: mapTrendRows(trendRows, period),
    businessAreas,
    expenseAnalysis,
    paymentMethods: paymentBreakdown.paymentMethods,
    cashMovement: paymentBreakdown.cashMovement,
    insights: buildInsights(currentSummary, previousSummary, businessAreas, expenseAnalysis, targets, outstandingResult.summary),
  };
}
