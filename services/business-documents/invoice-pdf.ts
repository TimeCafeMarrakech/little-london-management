import type { SupabaseClient } from "@supabase/supabase-js";

import type { InvoiceDetail, InvoiceStatus } from "@/features/finance/types";
import type { UserProfile } from "@/lib/auth/types";
import { SimplePdfDocument, wrapText } from "@/lib/pdf/simple-pdf";
import { canManageFinance, getInvoiceDetail } from "@/services/finance/finance-service";
import { formatBusinessDate as formatDate, formatMoney, displayValue as display, titleCase } from "@/services/business-documents/pdf-formatters";
import { addBusinessDocumentFooter, addBusinessDocumentHeader, drawSectionTitle, drawSummaryCard, drawTableHeader, ensureDocumentSpace, type PdfContext } from "@/services/business-documents/pdf-layout";
import { BUSINESS_DOCUMENT_COLORS as COLORS } from "@/services/business-documents/pdf-theme";
import { createSupabaseServerClient } from "@/supabase/server";

export type InvoiceDocumentData = InvoiceDetail & {
  parentPhone: string | null;
  parentEmail: string | null;
  studentNumber: string | null;
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

function statusColor(status: InvoiceStatus): string {
  if (status === "paid") {
    return COLORS.sage;
  }

  if (status === "partially_paid") {
    return COLORS.gold;
  }

  return COLORS.coral;
}

function addFooter(ctx: PdfContext): void {
  addBusinessDocumentFooter(ctx, {
    text: "Thank you for choosing Little London | Where Little Minds Grow | Mohammedia",
  });
}

function addHeader(ctx: PdfContext, invoice: InvoiceDocumentData): void {
  addBusinessDocumentHeader(ctx, {
    title: "Little London Invoice",
    metaLines: [invoice.invoiceNumber, `Issue: ${formatDate(invoice.issueDate)} | Due: ${formatDate(invoice.dueDate)}`],
    metaSizes: [10.5, 8.7],
    metaGap: 16,
    badge: {
      label: titleCase(invoice.status),
      x: 488,
      y: 794,
      width: 62,
      fill: statusColor(invoice.status),
      textColor: invoice.status === "paid" || invoice.status === "partially_paid" ? COLORS.navy : COLORS.white,
    },
  });
}

function ensureSpace(ctx: PdfContext, needed: number, invoice: InvoiceDocumentData): void {
  ensureDocumentSpace(ctx, needed, () => {
    addFooter(ctx);
    ctx.page = ctx.doc.addPage();
    ctx.pageNumber += 1;
    addHeader(ctx, invoice);
  });
}

function sectionTitle(ctx: PdfContext, title: string): void {
  drawSectionTitle(ctx, title);
}

function summaryCard(ctx: PdfContext, x: number, y: number, width: number, height: number, title: string, rows: Array<[string, string]>): void {
  drawSummaryCard(ctx, x, y, width, height, title, rows);
}

function addRecipientCards(ctx: PdfContext, invoice: InvoiceDocumentData): void {
  ensureSpace(ctx, 180, invoice);
  sectionTitle(ctx, "Bill To / Student");
  summaryCard(ctx, 42, ctx.y, 248, 146, "Bill To", [
    ["Parent", invoice.parentName],
    ["Phone", display(invoice.parentPhone)],
    ["Email", display(invoice.parentEmail)],
  ]);
  summaryCard(ctx, 305, ctx.y, 248, 146, "Student", [
    ["Student", invoice.studentName],
    ["Student Number", display(invoice.studentNumber)],
    ["Invoice Status", titleCase(invoice.status)],
  ]);
  ctx.y -= 170;
}

function addInvoiceItems(ctx: PdfContext, invoice: InvoiceDocumentData): void {
  ensureSpace(ctx, 120, invoice);
  sectionTitle(ctx, "Invoice Items");

  const tableX = 42;
  const widths = [278, 58, 84, 91];
  const headerY = ctx.y;
  drawTableHeader(ctx, tableX, headerY, [
    { label: "Description", x: tableX + 10 },
    { label: "Qty", x: tableX + widths[0] + 12 },
    { label: "Unit Price", x: tableX + widths[0] + widths[1] + 12 },
    { label: "Line Total", x: tableX + widths[0] + widths[1] + widths[2] + 12 },
  ]);
  ctx.y -= 28;

  if (invoice.items.length === 0) {
    ctx.doc.rect(ctx.page, tableX, ctx.y - 30, 511, 34, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, "No invoice items recorded.", tableX + 10, ctx.y - 17, 9.5, COLORS.muted);
    ctx.y -= 44;
    return;
  }

  invoice.items.forEach((item) => {
    const descriptionLines = wrapText(item.description, widths[0] - 20, 9.2).slice(0, 3);
    const rowHeight = Math.max(36, 18 + descriptionLines.length * 11);
    ensureSpace(ctx, rowHeight + 8, invoice);
    ctx.doc.rect(ctx.page, tableX, ctx.y - rowHeight, 511, rowHeight, COLORS.white, COLORS.border);
    descriptionLines.forEach((line, index) => {
      ctx.doc.text(ctx.page, line, tableX + 10, ctx.y - 16 - index * 11, 9.2, COLORS.navy);
    });
    ctx.doc.text(ctx.page, String(item.quantity), tableX + widths[0] + 12, ctx.y - 16, 9.2, COLORS.navy);
    ctx.doc.text(ctx.page, formatMoney(item.unitPrice), tableX + widths[0] + widths[1] + 12, ctx.y - 16, 8.8, COLORS.navy);
    ctx.doc.text(ctx.page, formatMoney(item.lineTotal), tableX + widths[0] + widths[1] + widths[2] + 12, ctx.y - 16, 8.8, COLORS.navy, "bold");
    ctx.y -= rowHeight;
  });

  ctx.y -= 18;
}

function addPaymentSummary(ctx: PdfContext, invoice: InvoiceDocumentData): void {
  ensureSpace(ctx, 180, invoice);
  sectionTitle(ctx, "Payment Summary");

  ctx.doc.rect(ctx.page, 42, ctx.y - 126, 260, 132, COLORS.cream, COLORS.border);
  const rows: Array<[string, string, string]> = [
    ["Subtotal", formatMoney(invoice.subtotal), COLORS.navy],
    ["Total", formatMoney(invoice.total), COLORS.navy],
    ["Amount Paid", formatMoney(invoice.amountPaid), COLORS.sage],
    ["Balance Due", formatMoney(invoice.balanceDue), invoice.balanceDue > 0 ? COLORS.coral : COLORS.sage],
    ["Status", titleCase(invoice.status), statusColor(invoice.status)],
  ];
  let rowY = ctx.y - 18;
  rows.forEach(([label, value, color]) => {
    ctx.doc.text(ctx.page, label, 58, rowY, 9, COLORS.muted, "bold");
    ctx.doc.text(ctx.page, value, 170, rowY, 10, color, "bold");
    rowY -= 22;
  });

  ctx.doc.rect(ctx.page, 318, ctx.y - 126, 235, 132, COLORS.white, COLORS.border);
  ctx.doc.text(ctx.page, "Accepted Payment Methods", 334, ctx.y - 18, 10.5, COLORS.navy, "bold");
  ctx.doc.text(ctx.page, "Cash", 334, ctx.y - 42, 9.5, COLORS.navy);
  ctx.doc.text(ctx.page, "Bank Transfer", 334, ctx.y - 62, 9.5, COLORS.navy);
  ctx.doc.text(ctx.page, "Cheque", 334, ctx.y - 82, 9.5, COLORS.navy);
  ctx.doc.text(ctx.page, invoice.payments.length > 0 ? "Payment allocations are reflected in the amount paid." : "No payment recorded.", 334, ctx.y - 106, 8.8, COLORS.muted);
  ctx.y -= 154;
}

function addClosingNote(ctx: PdfContext, invoice: InvoiceDocumentData): void {
  ensureSpace(ctx, 70, invoice);
  ctx.doc.rect(ctx.page, 42, ctx.y - 48, 511, 54, COLORS.cream, COLORS.border);
  ctx.doc.text(ctx.page, "Thank you for choosing Little London.", 58, ctx.y - 17, 10.5, COLORS.navy, "bold");
  ctx.doc.text(ctx.page, "Where Little Minds Grow | Mohammedia | Cash, Bank Transfer, and Cheque accepted", 58, ctx.y - 35, 8.8, COLORS.muted);
  ctx.y -= 70;
}

export async function getInvoiceDocumentData(profile: UserProfile, invoiceId: string): Promise<InvoiceDocumentData | null> {
  if (!canManageFinance(profile)) {
    throw new Error("forbidden");
  }

  const invoice = await getInvoiceDetail(profile, invoiceId);

  if (!invoice) {
    return null;
  }

  const supabase = (await createSupabaseServerClient()) as unknown as SupabaseClient;
  const [{ data: parentData }, { data: studentData }] = await Promise.all([
    supabase.from("parents").select("id, phone, email").eq("id", invoice.parentId).maybeSingle(),
    supabase.from("students").select("id, student_number").eq("id", invoice.studentId).maybeSingle(),
  ]);
  const parent = parentData as ParentContactRow | null;
  const student = studentData as StudentNumberRow | null;

  return {
    ...invoice,
    parentPhone: parent?.phone ?? null,
    parentEmail: parent?.email ?? null,
    studentNumber: student?.student_number ?? null,
  };
}

export function generateInvoicePdf(invoice: InvoiceDocumentData): Buffer {
  const doc = new SimplePdfDocument({
    title: `Little London Invoice - ${invoice.invoiceNumber}`,
    author: "Little London Play & Learn",
  });
  const ctx: PdfContext = {
    doc,
    page: doc.addPage(),
    y: 0,
    pageNumber: 1,
  };

  addHeader(ctx, invoice);
  addRecipientCards(ctx, invoice);
  addInvoiceItems(ctx, invoice);
  addPaymentSummary(ctx, invoice);
  addClosingNote(ctx, invoice);
  addFooter(ctx);

  return doc.build();
}
