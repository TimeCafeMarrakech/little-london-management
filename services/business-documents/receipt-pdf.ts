import type { SupabaseClient } from "@supabase/supabase-js";

import type { PaymentDetail, PaymentMethod } from "@/features/finance/types";
import type { UserProfile } from "@/lib/auth/types";
import { SimplePdfDocument } from "@/lib/pdf/simple-pdf";
import { formatBusinessDate as formatDate, formatMoney, displayValue as display, titleCase } from "@/services/business-documents/pdf-formatters";
import { addBusinessDocumentFooter, addBusinessDocumentHeader, drawSectionTitle, drawSummaryCard, drawTableHeader, ensureDocumentSpace, type PdfContext } from "@/services/business-documents/pdf-layout";
import { BUSINESS_DOCUMENT_COLORS as COLORS } from "@/services/business-documents/pdf-theme";
import { canManageFinance, getPaymentDetail } from "@/services/finance/finance-service";
import { createSupabaseServerClient } from "@/supabase/server";

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

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
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
  addBusinessDocumentFooter(ctx, {
    text: "Thank you for choosing Little London | Where Little Minds Grow | Mohammedia",
  });
}

function addHeader(ctx: PdfContext, receipt: ReceiptDocumentData): void {
  addBusinessDocumentHeader(ctx, {
    title: "Little London Receipt",
    metaLines: [receipt.paymentNumber, `Payment Date: ${formatDate(receipt.paymentDate)}`],
    metaSizes: [10.5, 8.7],
    metaGap: 16,
    badge: {
      label: "Received",
      x: 468,
      y: 794,
      width: 82,
      fill: COLORS.sage,
      textColor: COLORS.navy,
    },
  });
}

function ensureSpace(ctx: PdfContext, needed: number, receipt: ReceiptDocumentData): void {
  ensureDocumentSpace(ctx, needed, () => {
    addFooter(ctx);
    ctx.page = ctx.doc.addPage();
    ctx.pageNumber += 1;
    addHeader(ctx, receipt);
  });
}

function sectionTitle(ctx: PdfContext, title: string): void {
  drawSectionTitle(ctx, title);
}

function summaryCard(ctx: PdfContext, x: number, y: number, width: number, height: number, title: string, rows: Array<[string, string]>): void {
  drawSummaryCard(ctx, x, y, width, height, title, rows);
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
  drawTableHeader(ctx, tableX, ctx.y, [
    { label: "Invoice", x: tableX + 10 },
    { label: "Amount Allocated", x: tableX + 245 },
    { label: "Remaining Balance", x: tableX + 380 },
  ]);
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
