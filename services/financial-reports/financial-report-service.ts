import { unstable_noStore as noStore } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { hasAnyPermission, hasRole } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/types";
import { createSupabaseServerClient } from "@/supabase/server";

export type FinancialReportComparison = {
  difference: number;
  percentChange: number | null;
  label: string;
  isNeutral: boolean;
};

export type FinancialReportMetric = {
  label: string;
  value: number;
  previousValue: number;
  comparison: FinancialReportComparison;
};

export type FinancialReportTarget = {
  type: "revenue" | "profit" | "expense_budget" | "active_students";
  label: string;
  targetValue: number | null;
  actualValue: number | null;
  percentageAchieved: number | null;
  status: string;
};

export type FinancialReportBreakdownItem = {
  label: string;
  amount: number;
  percent: number;
};

export type FinancialReportBusinessArea = {
  label: string;
  income: number;
  expenses: number;
  profit: number;
  profitMargin: number | null;
};

export type FinancialReportOutstandingInvoice = {
  invoiceNumber: string;
  parentName: string;
  studentName: string;
  dueDate: string;
  total: number;
  paid: number;
  balance: number;
  status: string;
};

export type MonthlyFinancialReportData = {
  reportMonth: string;
  reportMonthLabel: string;
  monthStart: string;
  monthEnd: string;
  previousMonthStart: string;
  previousMonthEnd: string;
  generatedDate: string;
  executiveSummary: {
    invoicePaymentsReceived: number;
    cashbookIncome: number;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    outstandingInvoiceBalance: number;
    outstandingInvoiceCount: number;
    oldestOutstandingInvoiceAgeDays: number | null;
    activeStudentCount: number;
  };
  comparisons: {
    income: FinancialReportComparison;
    expenses: FinancialReportComparison;
    profit: FinancialReportComparison;
  };
  narrative: string[];
  incomeAnalysis: {
    invoicePaymentsReceived: number;
    cashbookIncome: number;
    byBusinessArea: FinancialReportBreakdownItem[];
    byPaymentMethod: FinancialReportBreakdownItem[];
  };
  expenseAnalysis: {
    totalExpenses: number;
    salaryTotal: number;
    largestExpenseCategory: FinancialReportBreakdownItem | null;
    byCategory: FinancialReportBreakdownItem[];
    byPaymentMethod: FinancialReportBreakdownItem[];
  };
  targets: FinancialReportTarget[];
  outstandingInvoices: FinancialReportOutstandingInvoice[];
  businessAreas: FinancialReportBusinessArea[];
};

type DateRange = {
  start: string;
  end: string;
};

type MonthlySummaryRow = {
  invoice_payment_total: number | null;
  cashbook_income_total: number | null;
  total_income: number | null;
  expense_total: number | null;
  net_profit: number | null;
};

type PaymentRow = {
  amount: number;
  payment_method: string;
};

type CashbookIncomeRow = {
  amount: number;
  payment_method: string;
  business_area_id: string;
};

type CashbookExpenseRow = {
  amount: number;
  payment_method: string;
  expense_category_id: string;
  business_area_id: string | null;
};

type NameRow = {
  id: string;
  name?: string | null;
  code?: string | null;
  full_name?: string | null;
};

type TargetProgressRow = {
  target_type: FinancialReportTarget["type"];
  target_value: number;
  current_value: number;
  percentage_achieved: number;
  target_status: string;
  business_area_id: string | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  parent_id: string;
  student_id: string;
  due_date: string;
  total: number;
  status: string;
};

type PaymentAllocationRow = {
  invoice_id: string;
  amount_allocated: number;
};

function toMoney(value: unknown): number {
  return Math.round(Number(value ?? 0) * 100) / 100;
}

function localDateString(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function normalizeFinancialReportMonth(month?: string | null): string {
  if (!month) {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("invalid_report_month");
  }

  return month;
}

function monthRange(month: string): DateRange {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: localDateString(year, monthNumber, 1),
    end: localDateString(year, monthNumber, daysInMonth(year, monthNumber)),
  };
}

function previousMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const previous = monthNumber === 1 ? { year: year - 1, month: 12 } : { year, month: monthNumber - 1 };
  return `${previous.year}-${previous.month.toString().padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(year, monthNumber - 1, 1));
}

function formatGeneratedDate(): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
}

function buildComparison(current: number, previous: number): FinancialReportComparison {
  const difference = toMoney(current - previous);

  if (previous === 0) {
    return {
      difference,
      percentChange: null,
      label: "No previous period",
      isNeutral: true,
    };
  }

  const percentChange = toMoney((difference / Math.abs(previous)) * 100);

  return {
    difference,
    percentChange,
    label: `${Math.abs(percentChange)}% ${difference >= 0 ? "up" : "down"}`,
    isNeutral: false,
  };
}

function percent(amount: number, total: number): number {
  return total > 0 ? toMoney((amount / total) * 100) : 0;
}

function paymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
    card: "Other",
    other: "Other",
  };

  return labels[method] ?? "Other";
}

function targetLabel(type: FinancialReportTarget["type"]): string {
  const labels: Record<FinancialReportTarget["type"], string> = {
    revenue: "Revenue Target",
    profit: "Profit Target",
    expense_budget: "Expense Budget",
    active_students: "Active Students",
  };

  return labels[type];
}

function emptyTarget(type: FinancialReportTarget["type"]): FinancialReportTarget {
  return {
    type,
    label: targetLabel(type),
    targetValue: null,
    actualValue: null,
    percentageAchieved: null,
    status: "Not set",
  };
}

async function createFinancialReportClient(): Promise<SupabaseClient> {
  return (await createSupabaseServerClient()) as unknown as SupabaseClient;
}

export function canViewFinancialReports(profile: UserProfile): boolean {
  return hasRole(profile, ["super_admin", "admin"]) && hasAnyPermission(profile, ["business_performance.view.all"]);
}

async function getMonthlySummary(supabase: SupabaseClient, range: DateRange): Promise<MonthlySummaryRow> {
  const { data, error } = await supabase
    .from("cashbook_monthly_summary_view")
    .select("invoice_payment_total, cashbook_income_total, total_income, expense_total, net_profit")
    .eq("summary_month", range.start)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as MonthlySummaryRow | null) ?? {
    invoice_payment_total: 0,
    cashbook_income_total: 0,
    total_income: 0,
    expense_total: 0,
    net_profit: 0,
  };
}

async function getRowsByRange<T>(supabase: SupabaseClient, table: string, select: string, dateColumn: string, range: DateRange): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .gte(dateColumn, range.start)
    .lte(dateColumn, range.end);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as T[];
}

async function getRecordedCashbookIncomeRows(supabase: SupabaseClient, range: DateRange): Promise<CashbookIncomeRow[]> {
  const { data, error } = await supabase
    .from("cashbook_income_entries")
    .select("amount, payment_method, business_area_id")
    .eq("status", "recorded")
    .is("deleted_at", null)
    .gte("income_date", range.start)
    .lte("income_date", range.end);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CashbookIncomeRow[];
}

async function getRecordedCashbookExpenseRows(supabase: SupabaseClient, range: DateRange): Promise<CashbookExpenseRow[]> {
  const { data, error } = await supabase
    .from("cashbook_expense_entries")
    .select("amount, payment_method, expense_category_id, business_area_id")
    .eq("status", "recorded")
    .is("deleted_at", null)
    .gte("expense_date", range.start)
    .lte("expense_date", range.end);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CashbookExpenseRow[];
}

async function getNameMap(supabase: SupabaseClient, table: string, ids: string[], select = "id, name"): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.from(table).select(select).in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(((data ?? []) as unknown as NameRow[]).map((row) => [row.id, row.name ?? row.full_name ?? "Unknown"]));
}

function breakdownFromMap(map: Map<string, number>, total: number): FinancialReportBreakdownItem[] {
  return Array.from(map.entries())
    .map(([label, amount]) => ({
      label,
      amount: toMoney(amount),
      percent: percent(amount, total),
    }))
    .sort((a, b) => b.amount - a.amount);
}

async function getIncomeAnalysis(supabase: SupabaseClient, range: DateRange, invoicePaymentsReceived: number, cashbookIncome: number): Promise<MonthlyFinancialReportData["incomeAnalysis"]> {
  const [payments, incomeRows] = await Promise.all([
    getRowsByRange<PaymentRow>(supabase, "payments", "amount, payment_method", "payment_date", range),
    getRecordedCashbookIncomeRows(supabase, range),
  ]);
  const areaNames = await getNameMap(supabase, "business_areas", incomeRows.map((row) => row.business_area_id));
  const byArea = new Map<string, number>();
  const byMethod = new Map<string, number>();

  if (invoicePaymentsReceived > 0) {
    byArea.set("Invoice Income / Unassigned", invoicePaymentsReceived);
  }

  incomeRows
    .filter((row) => row.amount > 0)
    .forEach((row) => {
      const area = areaNames.get(row.business_area_id) ?? "Unknown area";
      byArea.set(area, toMoney((byArea.get(area) ?? 0) + toMoney(row.amount)));
    });

  payments.forEach((row) => {
    const label = paymentMethodLabel(row.payment_method);
    byMethod.set(label, toMoney((byMethod.get(label) ?? 0) + toMoney(row.amount)));
  });

  incomeRows.forEach((row) => {
    const label = paymentMethodLabel(row.payment_method);
    byMethod.set(label, toMoney((byMethod.get(label) ?? 0) + toMoney(row.amount)));
  });

  return {
    invoicePaymentsReceived,
    cashbookIncome,
    byBusinessArea: breakdownFromMap(byArea, toMoney(invoicePaymentsReceived + cashbookIncome)),
    byPaymentMethod: breakdownFromMap(byMethod, toMoney(invoicePaymentsReceived + cashbookIncome)),
  };
}

async function getExpenseAnalysis(supabase: SupabaseClient, range: DateRange, totalExpenses: number): Promise<MonthlyFinancialReportData["expenseAnalysis"]> {
  const expenseRows = (await getRecordedCashbookExpenseRows(supabase, range)).filter((row) => row.amount > 0);
  const categoryNames = await getNameMap(supabase, "cashbook_expense_categories", expenseRows.map((row) => row.expense_category_id), "id, name, code");
  const byCategory = new Map<string, number>();
  const byMethod = new Map<string, number>();
  let salaryTotal = 0;

  expenseRows.forEach((row) => {
    const category = categoryNames.get(row.expense_category_id) ?? "Unknown category";
    byCategory.set(category, toMoney((byCategory.get(category) ?? 0) + toMoney(row.amount)));
    byMethod.set(paymentMethodLabel(row.payment_method), toMoney((byMethod.get(paymentMethodLabel(row.payment_method)) ?? 0) + toMoney(row.amount)));

    if (category.toLowerCase().includes("salary") || category.toLowerCase().includes("salaries")) {
      salaryTotal = toMoney(salaryTotal + toMoney(row.amount));
    }
  });

  const byCategoryItems = breakdownFromMap(byCategory, totalExpenses);

  return {
    totalExpenses,
    salaryTotal,
    largestExpenseCategory: byCategoryItems[0] ?? null,
    byCategory: byCategoryItems,
    byPaymentMethod: breakdownFromMap(byMethod, totalExpenses),
  };
}

async function getTargets(supabase: SupabaseClient, range: DateRange): Promise<FinancialReportTarget[]> {
  const { data, error } = await supabase
    .from("cashbook_target_progress_view")
    .select("target_type, target_value, current_value, percentage_achieved, target_status, business_area_id")
    .eq("target_month", range.start)
    .is("business_area_id", null);

  if (error) {
    throw new Error(error.message);
  }

  const byType = new Map((data ?? []).map((row) => {
    const target = row as TargetProgressRow;
    return [target.target_type, target];
  }));

  return (["revenue", "profit", "expense_budget", "active_students"] as FinancialReportTarget["type"][]).map((type) => {
    const target = byType.get(type);

    if (!target) {
      return emptyTarget(type);
    }

    return {
      type,
      label: targetLabel(type),
      targetValue: toMoney(target.target_value),
      actualValue: toMoney(target.current_value),
      percentageAchieved: toMoney(target.percentage_achieved),
      status: target.target_status,
    };
  });
}

async function getOutstandingInvoices(supabase: SupabaseClient): Promise<{
  totalOutstanding: number;
  count: number;
  oldestAgeDays: number | null;
  invoices: FinancialReportOutstandingInvoice[];
}> {
  const { data, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, parent_id, student_id, due_date, total, status")
    .in("status", ["issued", "partially_paid"])
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const invoiceRows = (data ?? []) as InvoiceRow[];
  const invoiceIds = invoiceRows.map((invoice) => invoice.id);
  const [allocationsResult, parentNames, studentNames] = await Promise.all([
    invoiceIds.length > 0
      ? supabase.from("payment_allocations").select("invoice_id, amount_allocated").in("invoice_id", invoiceIds)
      : Promise.resolve({ data: [], error: null }),
    getNameMap(supabase, "parents", invoiceRows.map((invoice) => invoice.parent_id), "id, full_name"),
    getNameMap(supabase, "students", invoiceRows.map((invoice) => invoice.student_id), "id, full_name"),
  ]);

  if (allocationsResult.error) {
    throw new Error(allocationsResult.error.message);
  }

  const paidByInvoice = new Map<string, number>();
  ((allocationsResult.data ?? []) as PaymentAllocationRow[]).forEach((allocation) => {
    paidByInvoice.set(allocation.invoice_id, toMoney((paidByInvoice.get(allocation.invoice_id) ?? 0) + toMoney(allocation.amount_allocated)));
  });

  const today = new Date();
  const invoices = invoiceRows
    .map((invoice) => {
      const paid = paidByInvoice.get(invoice.id) ?? 0;
      const balance = Math.max(toMoney(invoice.total) - paid, 0);
      return {
        invoiceNumber: invoice.invoice_number,
        parentName: parentNames.get(invoice.parent_id) ?? "Unknown parent",
        studentName: studentNames.get(invoice.student_id) ?? "Unknown student",
        dueDate: invoice.due_date,
        total: toMoney(invoice.total),
        paid,
        balance,
        status: invoice.status,
      };
    })
    .filter((invoice) => invoice.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const oldestAgeDays = invoices.length > 0
    ? Math.max(...invoices.map((invoice) => {
      const [year, month, day] = invoice.dueDate.split("-").map(Number);
      const dueDate = new Date(year, month - 1, day);
      return Math.max(Math.floor((today.getTime() - dueDate.getTime()) / 86400000), 0);
    }))
    : null;

  return {
    totalOutstanding: toMoney(invoices.reduce((sum, invoice) => sum + invoice.balance, 0)),
    count: invoices.length,
    oldestAgeDays,
    invoices: invoices.slice(0, 10),
  };
}

async function getBusinessAreas(supabase: SupabaseClient, range: DateRange, invoicePaymentsReceived: number, totalIncome: number): Promise<FinancialReportBusinessArea[]> {
  const [incomeRows, expenseRows] = await Promise.all([
    getRecordedCashbookIncomeRows(supabase, range),
    getRecordedCashbookExpenseRows(supabase, range),
  ]);
  const areaNames = await getNameMap(supabase, "business_areas", [
    ...incomeRows.map((row) => row.business_area_id),
    ...expenseRows.map((row) => row.business_area_id).filter(Boolean) as string[],
  ]);
  const rows = new Map<string, FinancialReportBusinessArea>();

  function ensureArea(id: string, label: string): FinancialReportBusinessArea {
    const existing = rows.get(id);
    if (existing) {
      return existing;
    }

    const next = { label, income: 0, expenses: 0, profit: 0, profitMargin: null };
    rows.set(id, next);
    return next;
  }

  if (invoicePaymentsReceived > 0) {
    ensureArea("invoice_income_unassigned", "Invoice Income / Unassigned").income = invoicePaymentsReceived;
  }

  incomeRows.forEach((row) => {
    const area = ensureArea(row.business_area_id, areaNames.get(row.business_area_id) ?? "Unknown area");
    area.income = toMoney(area.income + toMoney(row.amount));
  });

  expenseRows.forEach((row) => {
    const id = row.business_area_id ?? "unassigned_expenses";
    const area = ensureArea(id, row.business_area_id ? areaNames.get(row.business_area_id) ?? "Unknown area" : "Unassigned Expenses");
    area.expenses = toMoney(area.expenses + toMoney(row.amount));
  });

  return Array.from(rows.values())
    .map((row) => {
      const profit = toMoney(row.income - row.expenses);
      return {
        ...row,
        profit,
        profitMargin: row.income > 0 ? percent(profit, row.income) : null,
      };
    })
    .sort((a, b) => {
      if (totalIncome === 0) {
        return b.profit - a.profit;
      }

      return b.income - a.income;
    });
}

async function getActiveStudentCount(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

function buildNarrative(data: {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeComparison: FinancialReportComparison;
  expenseBudget: FinancialReportTarget | undefined;
  revenueTarget: FinancialReportTarget | undefined;
  outstandingInvoiceCount: number;
}): string[] {
  const lines: string[] = [];

  lines.push(data.incomeComparison.isNeutral ? "No previous-month income is available for comparison." : `Total income is ${data.incomeComparison.label} compared with the previous month.`);
  lines.push(data.netProfit >= 0 ? "Net profit is positive for the selected month." : "Net profit is negative for the selected month and requires management attention.");

  if (data.revenueTarget?.status && data.revenueTarget.status !== "Not set") {
    lines.push(`Revenue target status is ${data.revenueTarget.status}.`);
  }

  if (data.expenseBudget?.status && data.expenseBudget.status !== "Not set") {
    lines.push(`Expense budget status is ${data.expenseBudget.status}.`);
  }

  if (data.outstandingInvoiceCount > 0) {
    lines.push(`${data.outstandingInvoiceCount} outstanding invoice(s) require follow-up.`);
  }

  return lines.slice(0, 4);
}

export async function getMonthlyFinancialReportData(profile: UserProfile, monthInput?: string | null): Promise<MonthlyFinancialReportData> {
  noStore();

  if (!canViewFinancialReports(profile)) {
    throw new Error("forbidden");
  }

  const reportMonth = normalizeFinancialReportMonth(monthInput);
  const previous = previousMonth(reportMonth);
  const range = monthRange(reportMonth);
  const previousRange = monthRange(previous);
  const supabase = await createFinancialReportClient();
  const [
    currentSummary,
    previousSummary,
    targets,
    outstanding,
    activeStudentCount,
  ] = await Promise.all([
    getMonthlySummary(supabase, range),
    getMonthlySummary(supabase, previousRange),
    getTargets(supabase, range),
    getOutstandingInvoices(supabase),
    getActiveStudentCount(supabase),
  ]);

  const invoicePaymentsReceived = toMoney(currentSummary.invoice_payment_total);
  const cashbookIncome = toMoney(currentSummary.cashbook_income_total);
  const totalIncome = toMoney(currentSummary.total_income);
  const totalExpenses = toMoney(currentSummary.expense_total);
  const netProfit = toMoney(currentSummary.net_profit);
  const profitMargin = totalIncome > 0 ? percent(netProfit, totalIncome) : 0;
  const comparisons = {
    income: buildComparison(totalIncome, toMoney(previousSummary.total_income)),
    expenses: buildComparison(totalExpenses, toMoney(previousSummary.expense_total)),
    profit: buildComparison(netProfit, toMoney(previousSummary.net_profit)),
  };
  const [incomeAnalysis, expenseAnalysis, businessAreas] = await Promise.all([
    getIncomeAnalysis(supabase, range, invoicePaymentsReceived, cashbookIncome),
    getExpenseAnalysis(supabase, range, totalExpenses),
    getBusinessAreas(supabase, range, invoicePaymentsReceived, totalIncome),
  ]);

  return {
    reportMonth,
    reportMonthLabel: monthLabel(reportMonth),
    monthStart: range.start,
    monthEnd: range.end,
    previousMonthStart: previousRange.start,
    previousMonthEnd: previousRange.end,
    generatedDate: formatGeneratedDate(),
    executiveSummary: {
      invoicePaymentsReceived,
      cashbookIncome,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      outstandingInvoiceBalance: outstanding.totalOutstanding,
      outstandingInvoiceCount: outstanding.count,
      oldestOutstandingInvoiceAgeDays: outstanding.oldestAgeDays,
      activeStudentCount,
    },
    comparisons,
    narrative: buildNarrative({
      totalIncome,
      totalExpenses,
      netProfit,
      incomeComparison: comparisons.income,
      expenseBudget: targets.find((target) => target.type === "expense_budget"),
      revenueTarget: targets.find((target) => target.type === "revenue"),
      outstandingInvoiceCount: outstanding.count,
    }),
    incomeAnalysis,
    expenseAnalysis,
    targets,
    outstandingInvoices: outstanding.invoices,
    businessAreas,
  };
}
