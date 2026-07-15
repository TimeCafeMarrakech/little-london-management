import type { cashbookExpenseStatusSchema, cashbookIncomeStatusSchema, cashbookPaymentMethodSchema, cashbookPerformancePeriodSchema, cashbookTargetStatusSchema, cashbookTargetTypeSchema } from "@/features/cashbook/schemas";
import type { z } from "zod";

export type CashbookPaymentMethod = z.infer<typeof cashbookPaymentMethodSchema>;
export type CashbookIncomeStatus = z.infer<typeof cashbookIncomeStatusSchema>;
export type CashbookExpenseStatus = z.infer<typeof cashbookExpenseStatusSchema>;
export type CashbookTargetStatus = z.infer<typeof cashbookTargetStatusSchema>;
export type CashbookTargetType = z.infer<typeof cashbookTargetTypeSchema>;
export type CashbookPerformancePeriod = z.infer<typeof cashbookPerformancePeriodSchema>;

export type CashbookOption = {
  id: string;
  label: string;
  helper?: string;
};

export type CashbookIncomeSummary = {
  todayIncome: number;
  weekIncome: number;
  monthIncome: number;
  totalRecords: number;
};

export type CashbookIncomeListItem = {
  id: string;
  incomeDate: string;
  amount: number;
  businessAreaId: string;
  businessAreaName: string;
  incomeCategoryId: string;
  incomeCategoryName: string;
  paymentMethod: CashbookPaymentMethod;
  parentId: string | null;
  parentName: string | null;
  studentId: string | null;
  studentName: string | null;
  description: string;
  notes: string | null;
  status: CashbookIncomeStatus;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
};

export type CashbookIncomeDetail = CashbookIncomeListItem;

export type CashbookIncomeListResult = {
  entries: CashbookIncomeListItem[];
  summary: CashbookIncomeSummary;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type CashbookExpenseSummary = {
  todayExpenses: number;
  weekExpenses: number;
  monthExpenses: number;
  totalRecords: number;
};

export type CashbookExpenseListItem = {
  id: string;
  expenseDate: string;
  amount: number;
  expenseCategoryId: string;
  expenseCategoryName: string;
  businessAreaId: string | null;
  businessAreaName: string | null;
  supplierOrStaffName: string | null;
  paymentMethod: CashbookPaymentMethod;
  description: string;
  notes: string | null;
  status: CashbookExpenseStatus;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
};

export type CashbookExpenseDetail = CashbookExpenseListItem;

export type CashbookExpenseListResult = {
  expenses: CashbookExpenseListItem[];
  summary: CashbookExpenseSummary;
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type CashbookTargetProgress = {
  targetId: string;
  branchId: string | null;
  targetMonth: string;
  targetType: CashbookTargetType;
  targetValue: number;
  currentValue: number;
  remainingValue: number;
  percentageAchieved: number;
  daysRemaining: number;
  projectedMonthEndValue: number;
  averageRequiredPerRemainingDay: number;
  targetStatus: "Achieved" | "On Track" | "Needs Attention" | "At Risk" | "No target";
  businessAreaId: string | null;
  businessAreaName: string | null;
};

export type CashbookTargetListItem = CashbookTargetProgress & {
  id: string;
  status: CashbookTargetStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
};

export type CashbookTargetDetail = CashbookTargetListItem;

export type CashbookTargetListResult = {
  targets: CashbookTargetListItem[];
  progressCards: CashbookTargetProgress[];
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type CashbookActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type CashbookComparison = {
  difference: number;
  percentChange: number | null;
  isNeutral: boolean;
  label: string;
};

export type CashbookExecutiveSummaryMetric = {
  id: "invoice_payments" | "cashbook_income" | "total_income" | "expenses" | "net_profit" | "outstanding_invoices" | "profit_margin";
  label: string;
  value: number;
  valueType: "money" | "percent";
  helper: string;
  comparison: CashbookComparison | null;
  tone: "coral" | "sage" | "yellow" | "navy";
};

export type CashbookTrendPoint = {
  label: string;
  date: string;
  totalIncome: number;
  expenses: number;
  netProfit: number;
};

export type CashbookOutstandingInvoiceSummary = {
  totalOutstanding: number;
  unpaidInvoiceCount: number;
  oldestOutstandingInvoiceAgeDays: number | null;
};

export type CashbookTodayBusinessGoal = {
  revenueTarget: CashbookTargetProgress | null;
};

export type CashbookStudentKpis = {
  activeStudents: number;
  newActiveStudentsThisMonth: number | null;
  archivedOrInactiveThisMonth: number | null;
  limitation: string | null;
};

export type CashbookBusinessAreaPerformanceItem = {
  id: string;
  name: string;
  income: number;
  expenses: number;
  profit: number;
  profitMargin: number | null;
  shareOfTotalIncome: number;
  targetStatus: CashbookTargetProgress["targetStatus"] | "Not set";
};

export type CashbookExpenseCategoryAnalysisItem = {
  id: string;
  name: string;
  total: number;
  percentOfExpenses: number;
};

export type CashbookExpenseCategoryAnalysis = {
  totalExpenses: number;
  largestCategory: CashbookExpenseCategoryAnalysisItem | null;
  salaryTotal: number;
  categories: CashbookExpenseCategoryAnalysisItem[];
};

export type CashbookPaymentMethodBreakdownItem = {
  method: "cash" | "bank_transfer" | "cheque" | "other";
  label: string;
  invoicePaymentIncome: number;
  cashbookIncome: number;
  expenseOutflow: number;
  netMovement: number;
};

export type CashbookCashMovement = {
  cashReceived: number;
  cashExpenses: number;
  netCashMovement: number;
};

export type CashbookManagementInsight = {
  title: string;
  detail: string;
  tone: "coral" | "sage" | "yellow" | "navy";
};

export type CashbookPerformanceDashboard = {
  period: CashbookPerformancePeriod;
  periodLabel: string;
  currentRange: { start: string; end: string };
  previousRange: { start: string; end: string };
  summaryCards: CashbookExecutiveSummaryMetric[];
  outstandingInvoices: CashbookOutstandingInvoiceSummary;
  todayBusinessGoal: CashbookTodayBusinessGoal;
  monthlyTargets: CashbookTargetProgress[];
  studentKpis: CashbookStudentKpis;
  trends: CashbookTrendPoint[];
  businessAreas: CashbookBusinessAreaPerformanceItem[];
  expenseAnalysis: CashbookExpenseCategoryAnalysis;
  paymentMethods: CashbookPaymentMethodBreakdownItem[];
  cashMovement: CashbookCashMovement;
  insights: CashbookManagementInsight[];
};
