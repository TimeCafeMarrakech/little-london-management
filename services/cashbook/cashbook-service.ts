import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { CashbookExpenseFormInput, CashbookExpenseListQuery, CashbookIncomeFormInput, CashbookIncomeListQuery } from "@/features/cashbook/schemas";
import type {
  CashbookExpenseDetail,
  CashbookExpenseListItem,
  CashbookExpenseListResult,
  CashbookExpenseSummary,
  CashbookIncomeDetail,
  CashbookIncomeListItem,
  CashbookIncomeListResult,
  CashbookIncomeSummary,
  CashbookOption,
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
  emptyResultError: "income_not_found" | "income_not_editable" | "income_already_changed" | "expense_not_found" | "expense_not_editable" | "expense_already_changed",
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
  if (!canViewCashbookIncome(profile) && !canCreateCashbookIncome(profile) && !canViewCashbookExpenses(profile) && !canCreateCashbookExpenses(profile)) {
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
