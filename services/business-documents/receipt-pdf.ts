import type { SupabaseClient } from "@supabase/supabase-js";

import type { PaymentDetail, PaymentMethod } from "@/features/finance/types";
import type { UserProfile } from "@/lib/auth/types";
import { SimplePdfDocument, wrapText } from "@/lib/pdf/simple-pdf";
import { canManageFinance, getPaymentDetail } from "@/services/finance/finance-service";
import { createSupabaseServerClient } from "@/supabase/server";

const COLORS = {
  coral: "#F24A3A",
  navy: "#0F2747",
  sage: "#A8C3B0",
  cream: "#FFF8EE",
  gold: "#D6B36A",
  border: "#EADFCF",
  muted: "#5B6F82",
  white: "#FFFFFF",
};

type PdfContext = {
  doc: SimplePdfDocument;
  page: ReturnType<SimplePdfDocument["addPage"]>;
  y: number;
  pageNumber: number;
};

type ParentContactRow = {
  id: string;
  phone: string | null;
  email: string | null;
};

type StudentNumberRow = {
  id: string;
  student_number: string | null;
};

type InvoiceBalanceRow = {
  id: string;
  invoice_number: string;
  total: number;
};

type AllocationRow = {
  invoice_id: string;
  amount_allocated: number;
};

export type ReceiptAllocation = {
  invoiceNumber: string;
  amountAllocated: number;
  remainingBalance: number | null;
};

export type ReceiptDocumentData = PaymentDetail & {
  parentPhone: string | null;
  parentEmail: string | null;
  studentNumber: string | null;
  receiptAllocations: ReceiptAllocation[];
};

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function display(value: string | null | undefined): string {
  return value && value.trim() ? value : "Not recorded";
}

function paymentMethodColor(method: PaymentMethod): string {
  if (method === "cheque") {
    return COLORS.gold;
  }

  if (method === "bank_transfer") {
    return COLORS.sage;
  }

  return COLORS.coral;
}

function addFooter(ctx: PdfContext): void {
  const { doc, page } = ctx;

  doc.line(page, 42, 44, 553, 44, COLORS.border, 0.8);
  doc.text(page, "Thank you for choosing Little London | Where Little Minds Grow | Mohammedia", 42, 30, 8.5, COLORS.muted);
  doc.text(page, `Page ${ctx.pageNumber}`, 520, 30, 8.5, COLORS.muted);
}

function addBusLogo(ctx: PdfContext, cx: number, cy: number): void {
  const { doc, page } = ctx;

  doc.circle(page, cx, cy, 24, COLORS.coral);
  doc.rect(page, cx - 14, cy - 7, 28, 17, COLORS.coral, COLORS.white);
  doc.line(page, cx - 10, cy + 5, cx + 10, cy + 5, COLORS.white, 1);
  doc.line(page, cx - 10, cy, cx + 10, cy, COLORS.white, 1);
  doc.line(page, cx - 6, cy - 7, cx - 6, cy + 10, COLORS.white, 1);
  doc.line(page, cx + 2, cy - 7, cx + 2, cy + 10, COLORS.white, 1);
  doc.circle(page, cx - 7, cy - 9, 2.5, COLORS.white);
  doc.circle(page, cx + 7, cy - 9, 2.5, COLORS.white);
}

function addHeader(ctx: PdfContext, receipt: ReceiptDocumentData): void {
  const { doc, page } = ctx;

  doc.rect(page, 0, 0, doc.width, doc.height, COLORS.white);
  doc.rect(page, 0, 736, doc.width, 106, COLORS.cream);
  addBusLogo(ctx, 62, 792);
  doc.text(page, "LITTLE LONDON", 96, 805, 16, COLORS.coral, "bold");
  doc.text(page, "PLAY & LEARN", 98, 787, 9.5, COLORS.sage, "bold");
  doc.text(page, "Where Little Minds Grow", 98, 769, 10, COLORS.muted);

  doc.text(page, "Little London Receipt", 318, 803, 12.5, COLORS.navy, "bold");
  doc.text(page, receipt.paymentNumber, 318, 784, 10.5, COLORS.muted);
  doc.text(page, `Payment Date: ${formatDate(receipt.paymentDate)}`, 318, 768, 8.7, COLORS.muted);
  doc.rect(page, 468, 794, 82, 18, COLORS.sage, COLORS.sage);
  doc.text(page, "Received", 480, 800, 8, COLORS.navy, "bold");
  doc.line(page, 42, 734, 553, 734, COLORS.coral, 2);
  ctx.y = 690;
}

function ensureSpace(ctx: PdfContext, needed: number, receipt: ReceiptDocumentData): void {
  if (ctx.y - needed > 70) {
    return;
  }

  addFooter(ctx);
  ctx.page = ctx.doc.addPage();
  ctx.pageNumber += 1;
  addHeader(ctx, receipt);
}

function sectionTitle(ctx: PdfContext, title: string): void {
  ctx.doc.text(ctx.page, title, 46, ctx.y, 13, COLORS.coral, "bold");
  ctx.y -= 18;
}

function summaryCard(ctx: PdfContext, x: number, y: number, width: number, height: number, title: string, rows: Array<[string, string]>): void {
  ctx.doc.rect(ctx.page, x, y - height, width, height, COLORS.cream, COLORS.border);
  ctx.doc.text(ctx.page, title, x + 12, y - 18, 10.5, COLORS.navy, "bold");
  let rowY = y - 44;

  rows.forEach(([label, value]) => {
    ctx.doc.text(ctx.page, label, x + 12, rowY, 7.8, COLORS.muted, "bold");
    wrapText(value, width - 24, 9.3).slice(0, 2).forEach((line, index) => {
      ctx.doc.text(ctx.page, line, x + 12, rowY - 12 - index * 10, 9.3, COLORS.navy);
    });
    rowY -= 42;
  });
}

function addRecipientCards(ctx: PdfContext, receipt: ReceiptDocumentData): void {
  ensureSpace(ctx, 180, receipt);
  sectionTitle(ctx, "Received From / Student");
  summaryCard(ctx, 42, ctx.y, 248, 146, "Received From", [
    ["Parent", receipt.parentName],
    ["Phone", display(receipt.parentPhone)],
    ["Email", display(receipt.parentEmail)],
  ]);
  summaryCard(ctx, 305, ctx.y, 248, 146, "Student", [
    ["Student", receipt.studentName],
    ["Student Number", display(receipt.studentNumber)],
    ["Receipt Status", "Received"],
  ]);
  ctx.y -= 170;
}

function addPaymentSummary(ctx: PdfContext, receipt: ReceiptDocumentData): void {
  ensureSpace(ctx, 170, receipt);
  sectionTitle(ctx, "Payment Summary");

  ctx.doc.rect(ctx.page, 42, ctx.y - 118, 511, 124, COLORS.cream, COLORS.border);
  const rows: Array<[string, string, string]> = [
    ["Payment Amount", formatMoney(receipt.amount), COLORS.sage],
    ["Payment Method", titleCase(receipt.paymentMethod), paymentMethodColor(receipt.paymentMethod)],
    ["Payment Reference", display(receipt.referenceNumber), COLORS.navy],
    ["Allocated Amount", formatMoney(receipt.allocatedAmount), COLORS.navy],
    ["Unallocated Amount", formatMoney(Math.max(receipt.amount - receipt.allocatedAmount, 0)), COLORS.gold],
  ];
  let rowY = ctx.y - 20;

  rows.forEach(([label, value, color]) => {
    ctx.doc.text(ctx.page, label, 58, rowY, 8.8, COLORS.muted, "bold");
    ctx.doc.text(ctx.page, value, 218, rowY, 10, color, "bold");
    rowY -= 21;
  });

  ctx.y -= 144;
}

function addAllocationSummary(ctx: PdfContext, receipt: ReceiptDocumentData): void {
  ensureSpace(ctx, 116, receipt);
  sectionTitle(ctx, "Linked Invoice Allocation");

  const tableX = 42;
  ctx.doc.rect(ctx.page, tableX, ctx.y - 24, 511, 28, COLORS.cream, COLORS.border);
  ctx.doc.text(ctx.page, "Invoice", tableX + 10, ctx.y - 13, 8.3, COLORS.muted, "bold");
  ctx.doc.text(ctx.page, "Amount Allocated", tableX + 245, ctx.y - 13, 8.3, COLORS.muted, "bold");
  ctx.doc.text(ctx.page, "Remaining Balance", tableX + 380, ctx.y - 13, 8.3, COLORS.muted, "bold");
  ctx.y -= 28;

  if (receipt.receiptAllocations.length === 0) {
    ctx.doc.rect(ctx.page, tableX, ctx.y - 32, 511, 36, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, "This payment has not been allocated to an invoice yet.", tableX + 10, ctx.y - 18, 9.3, COLORS.muted);
    ctx.y -= 50;
    return;
  }

  receipt.receiptAllocations.forEach((allocation) => {
    ensureSpace(ctx, 44, receipt);
    ctx.doc.rect(ctx.page, tableX, ctx.y - 34, 511, 38, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, allocation.invoiceNumber, tableX + 10, ctx.y - 18, 9.3, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, formatMoney(allocation.amountAllocated), tableX + 245, ctx.y - 18, 9.1, COLORS.navy);
    ctx.doc.text(ctx.page, allocation.remainingBalance === null ? "Not recorded" : formatMoney(allocation.remainingBalance), tableX + 380, ctx.y - 18, 9.1, allocation.remainingBalance && allocation.remainingBalance > 0 ? COLORS.coral : COLORS.sage);
    ctx.y -= 38;
  });

  ctx.y -= 18;
}

function addClosingNote(ctx: PdfContext, receipt: ReceiptDocumentData): void {
  ensureSpace(ctx, 70, receipt);
  ctx.doc.rect(ctx.page, 42, ctx.y - 48, 511, 54, COLORS.cream, COLORS.border);
  ctx.doc.text(ctx.page, "Thank you for your payment.", 58, ctx.y - 17, 10.5, COLORS.navy, "bold");
  ctx.doc.text(ctx.page, "Thank you for choosing Little London | Where Little Minds Grow | Mohammedia", 58, ctx.y - 35, 8.8, COLORS.muted);
  ctx.y -= 70;
}

async function buildReceiptAllocations(supabase: SupabaseClient, payment: PaymentDetail): Promise<ReceiptAllocation[]> {
  const invoiceIds = payment.allocations.map((allocation) => allocation.invoiceId);

  if (invoiceIds.length === 0) {
    return [];
  }

  const [{ data: invoiceData }, { data: allocationData }] = await Promise.all([
    supabase.from("invoices").select("id, invoice_number, total").in("id", invoiceIds),
    supabase.from("payment_allocations").select("invoice_id, amount_allocated").in("invoice_id", invoiceIds),
  ]);
  const invoices = new Map(((invoiceData ?? []) as InvoiceBalanceRow[]).map((invoice) => [invoice.id, invoice]));
  const paidByInvoice = new Map<string, number>();

  ((allocationData ?? []) as AllocationRow[]).forEach((allocation) => {
    paidByInvoice.set(allocation.invoice_id, roundMoney((paidByInvoice.get(allocation.invoice_id) ?? 0) + Number(allocation.amount_allocated ?? 0)));
  });

  return payment.allocations.map((allocation) => {
    const invoice = invoices.get(allocation.invoiceId);
    const total = Number(invoice?.total ?? 0);
    const paid = paidByInvoice.get(allocation.invoiceId);

    return {
      invoiceNumber: invoice?.invoice_number ?? allocation.invoiceNumber,
      amountAllocated: allocation.amountAllocated,
      remainingBalance: paid === undefined ? null : roundMoney(Math.max(total - paid, 0)),
    };
  });
}

export async function getReceiptDocumentData(profile: UserProfile, paymentId: string): Promise<ReceiptDocumentData | null> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const payment = await getPaymentDetail(profile, paymentId);

  if (!payment) {
    return null;
  }

  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient;
  const [{ data: parentData }, { data: studentData }, receiptAllocations] = await Promise.all([
    supabase.from("parents").select("id, phone, email").eq("id", payment.parentId).maybeSingle(),
    supabase.from("students").select("id, student_number").eq("id", payment.studentId).maybeSingle(),
    buildReceiptAllocations(supabase, payment),
  ]);
  const parent = parentData as ParentContactRow | null;
  const student = studentData as StudentNumberRow | null;

  return {
    ...payment,
    parentPhone: parent?.phone ?? null,
    parentEmail: parent?.email ?? null,
    studentNumber: student?.student_number ?? null,
    receiptAllocations,
  };
}

export function generateReceiptPdf(receipt: ReceiptDocumentData): Buffer {
  const doc = new SimplePdfDocument({
    title: `Little London Receipt - ${receipt.paymentNumber}`,
    author: "Little London Play & Learn",
  });
  const ctx: PdfContext = {
    doc,
    page: doc.addPage(),
    y: 0,
    pageNumber: 1,
  };

  addHeader(ctx, receipt);
  addRecipientCards(ctx, receipt);
  addPaymentSummary(ctx, receipt);
  addAllocationSummary(ctx, receipt);
  addClosingNote(ctx, receipt);
  addFooter(ctx);

  return doc.build();
}
