import { z } from "zod";

const optionalUuid = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(z.string().uuid().nullable());

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

export const cashbookPaymentMethodSchema = z.enum(["cash", "bank_transfer", "cheque"]);
export const cashbookIncomeStatusSchema = z.enum(["recorded", "void", "archived"]);
export const cashbookExpenseStatusSchema = z.enum(["recorded", "void", "archived"]);
export const cashbookTargetStatusSchema = z.enum(["active", "archived"]);
export const cashbookTargetTypeSchema = z.enum(["revenue", "profit", "expense_budget", "active_students"]);

export const cashbookIncomeFormSchema = z.object({
  incomeDate: z.string().date("Choose an income date."),
  amount: z.coerce.number().positive("Amount must be greater than 0.").max(9999999),
  businessAreaId: z.string().uuid("Choose a business area."),
  incomeCategoryId: z.string().uuid("Choose an income category."),
  paymentMethod: cashbookPaymentMethodSchema,
  parentId: optionalUuid,
  studentId: optionalUuid,
  description: z.string().trim().min(2, "Description is required.").max(180),
  notes: optionalText,
});

export const cashbookIncomeListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  dateFrom: z.string().date().optional().or(z.literal("")).default(""),
  dateTo: z.string().date().optional().or(z.literal("")).default(""),
  businessAreaId: z.string().uuid().optional().or(z.literal("all")).default("all"),
  incomeCategoryId: z.string().uuid().optional().or(z.literal("all")).default("all"),
  paymentMethod: z.enum(["all", "cash", "bank_transfer", "cheque"]).optional().default("all"),
  status: z.enum(["all", "recorded", "void", "archived"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  sort: z.enum(["income_date", "created_at", "amount", "description", "status"]).optional().default("income_date"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const cashbookIncomeIdSchema = z.object({
  incomeId: z.string().uuid(),
});

export const cashbookExpenseFormSchema = z.object({
  expenseDate: z.string().date("Choose an expense date."),
  amount: z.coerce.number().positive("Amount must be greater than 0.").max(9999999),
  expenseCategoryId: z.string().uuid("Choose an expense category."),
  businessAreaId: optionalUuid,
  paymentMethod: cashbookPaymentMethodSchema,
  supplierOrStaffName: optionalText,
  description: optionalText,
  notes: optionalText,
});

export const cashbookExpenseListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  dateFrom: z.string().date().optional().or(z.literal("")).default(""),
  dateTo: z.string().date().optional().or(z.literal("")).default(""),
  businessAreaId: z.string().uuid().optional().or(z.literal("all")).default("all"),
  expenseCategoryId: z.string().uuid().optional().or(z.literal("all")).default("all"),
  paymentMethod: z.enum(["all", "cash", "bank_transfer", "cheque"]).optional().default("all"),
  status: z.enum(["all", "recorded", "void", "archived"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  sort: z.enum(["expense_date", "created_at", "amount", "description", "status"]).optional().default("expense_date"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const cashbookExpenseIdSchema = z.object({
  expenseId: z.string().uuid(),
});

export const cashbookTargetFormSchema = z.object({
  targetMonth: z.string().date("Choose a target month."),
  targetType: cashbookTargetTypeSchema,
  targetValue: z.coerce.number().min(0, "Target value must be 0 or greater.").max(999999999),
  businessAreaId: optionalUuid,
  notes: optionalText,
});

export const cashbookTargetListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  targetMonth: z.string().date().optional().or(z.literal("")).default(""),
  targetType: z.enum(["all", "revenue", "profit", "expense_budget", "active_students"]).optional().default("all"),
  businessAreaId: z.string().uuid().optional().or(z.literal("all")).default("all"),
  status: z.enum(["all", "active", "archived"]).optional().default("active"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  sort: z.enum(["target_month", "target_type", "target_value", "status", "created_at"]).optional().default("target_month"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const cashbookTargetIdSchema = z.object({
  targetId: z.string().uuid(),
});

export type CashbookIncomeFormInput = z.infer<typeof cashbookIncomeFormSchema>;
export type CashbookIncomeListQuery = z.infer<typeof cashbookIncomeListQuerySchema>;
export type CashbookExpenseFormInput = z.infer<typeof cashbookExpenseFormSchema>;
export type CashbookExpenseListQuery = z.infer<typeof cashbookExpenseListQuerySchema>;
export type CashbookTargetFormInput = z.infer<typeof cashbookTargetFormSchema>;
export type CashbookTargetListQuery = z.infer<typeof cashbookTargetListQuerySchema>;
