import type { SupabaseClient } from "@supabase/supabase-js";

import type { InvoiceDetail, InvoiceStatus } from "@/features/finance/types";
import type { UserProfile } from "@/lib/auth/types";
import { SimplePdfDocument, wrapText } from "@/lib/pdf/simple-pdf";
import { canManageFinance, getInvoiceDetail } from "@/services/finance/finance-service";
import { createSupabaseServerClient } from "@/supabase/server";

const COLORS = {
  coral: "#F24A3A",
  navy: "#0F2747",
  sage: "#A8C3B0",
  mint: "#BFE2D0",
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

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function display(value: string | null | undefined): string {
  return value && value.trim() ? value : "Not recorded";
}

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

function addHeader(ctx: PdfContext, invoice: InvoiceDocumentData): void {
  const { doc, page } = ctx;

  doc.rect(page, 0, 0, doc.width, doc.height, COLORS.white);
  doc.rect(page, 0, 736, doc.width, 106, COLORS.cream);
  addBusLogo(ctx, 62, 792);
  doc.text(page, "LITTLE LONDON", 96, 805, 16, COLORS.coral, "bold");
  doc.text(page, "PLAY & LEARN", 98, 787, 9.5, COLORS.sage, "bold");
  doc.text(page, "Where Little Minds Grow", 98, 769, 10, COLORS.muted);

  doc.text(page, "Little London Invoice", 318, 803, 12.5, COLORS.navy, "bold");
  doc.text(page, invoice.invoiceNumber, 318, 784, 10.5, COLORS.muted);
  doc.text(page, `Issue: ${formatDate(invoice.issueDate)} | Due: ${formatDate(invoice.dueDate)}`, 318, 768, 8.7, COLORS.muted);
  doc.rect(page, 488, 794, 62, 18, statusColor(invoice.status), statusColor(invoice.status));
  doc.text(page, titleCase(invoice.status), 498, 800, 8, invoice.status === "paid" || invoice.status === "partially_paid" ? COLORS.navy : COLORS.white, "bold");
  doc.line(page, 42, 734, 553, 734, COLORS.coral, 2);
  ctx.y = 690;
}

function ensureSpace(ctx: PdfContext, needed: number, invoice: InvoiceDocumentData): void {
  if (ctx.y - needed > 70) {
    return;
  }

  addFooter(ctx);
  ctx.page = ctx.doc.addPage();
  ctx.pageNumber += 1;
  addHeader(ctx, invoice);
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
  ctx.doc.rect(ctx.page, tableX, headerY - 24, 511, 28, COLORS.cream, COLORS.border);
  ctx.doc.text(ctx.page, "Description", tableX + 10, headerY - 13, 8.3, COLORS.muted, "bold");
  ctx.doc.text(ctx.page, "Qty", tableX + widths[0] + 12, headerY - 13, 8.3, COLORS.muted, "bold");
  ctx.doc.text(ctx.page, "Unit Price", tableX + widths[0] + widths[1] + 12, headerY - 13, 8.3, COLORS.muted, "bold");
  ctx.doc.text(ctx.page, "Line Total", tableX + widths[0] + widths[1] + widths[2] + 12, headerY - 13, 8.3, COLORS.muted, "bold");
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
