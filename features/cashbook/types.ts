import type { cashbookExpenseStatusSchema, cashbookIncomeStatusSchema, cashbookPaymentMethodSchema } from "@/features/cashbook/schemas";
import type { z } from "zod";

export type CashbookPaymentMethod = z.infer<typeof cashbookPaymentMethodSchema>;
export type CashbookIncomeStatus = z.infer<typeof cashbookIncomeStatusSchema>;
export type CashbookExpenseStatus = z.infer<typeof cashbookExpenseStatusSchema>;

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

export type CashbookActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
