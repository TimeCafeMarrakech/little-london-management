import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const money = z.coerce.number().min(0).max(9999999).transform((value) => Math.round(value * 100) / 100);

export const invoiceStatusSchema = z.enum(["draft", "issued", "partially_paid", "paid", "cancelled"]);
export const editableInvoiceStatusSchema = z.enum(["draft", "issued", "cancelled"]);
export const paymentMethodSchema = z.enum(["cash", "card", "bank_transfer", "cheque", "other"]);

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(2, "Description is required.").max(180),
  quantity: z.coerce.number().positive("Quantity must be greater than 0.").max(999),
  unitPrice: money,
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().trim().min(2, "Invoice number is required.").max(60),
  parentId: z.string().uuid("Choose a parent."),
  studentId: z.string().uuid("Choose a student."),
  issueDate: z.string().date("Choose an issue date."),
  dueDate: z.string().date("Choose a due date."),
  status: editableInvoiceStatusSchema,
  notes: optionalText,
  items: z.array(invoiceItemSchema).min(1, "Add at least one invoice item."),
}).refine((value) => value.dueDate >= value.issueDate, {
  message: "Due date must be on or after the issue date.",
  path: ["dueDate"],
});

export const invoiceListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  status: z.enum(["all", "draft", "issued", "partially_paid", "paid", "cancelled", "archived"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["created_at", "invoice_number", "issue_date", "due_date", "total", "status"]).optional().default("created_at"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const invoiceArchiveSchema = z.object({
  invoiceId: z.string().uuid(),
});

export const paymentAllocationSchema = z.object({
  invoiceId: z.string().uuid("Choose an invoice."),
  amountAllocated: z.coerce.number().positive("Allocation must be greater than 0.").max(9999999),
});

export const paymentFormSchema = z.object({
  paymentNumber: z.string().trim().min(2, "Payment number is required.").max(60),
  parentId: z.string().uuid("Choose a parent."),
  studentId: z.string().uuid("Choose a student."),
  paymentDate: z.string().date("Choose a payment date."),
  amount: z.coerce.number().positive("Payment amount must be greater than 0.").max(9999999),
  paymentMethod: paymentMethodSchema,
  referenceNumber: optionalText,
  notes: optionalText,
  allocations: z.array(paymentAllocationSchema).default([]),
}).refine((value) => value.allocations.reduce((sum, allocation) => sum + allocation.amountAllocated, 0) <= value.amount, {
  message: "Allocated amount cannot exceed the payment amount.",
  path: ["amount"],
});

export const paymentListQuerySchema = z.object({
  query: z.string().trim().optional().default(""),
  method: z.enum(["all", "cash", "card", "bank_transfer", "cheque", "other"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["created_at", "payment_number", "payment_date", "amount", "payment_method"]).optional().default("created_at"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
export type InvoiceArchiveInput = z.infer<typeof invoiceArchiveSchema>;
export type PaymentFormInput = z.infer<typeof paymentFormSchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
