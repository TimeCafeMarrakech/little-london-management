import { SimplePdfDocument, wrapText } from "@/lib/pdf/simple-pdf";
import { formatBusinessDate, formatMoney, titleCase } from "@/services/business-documents/pdf-formatters";
import {
  addBusinessDocumentFooter,
  addBusinessDocumentHeader,
  drawSectionTitle,
  drawSummaryCard,
  drawTableHeader,
  ensureDocumentSpace,
  type PdfContext,
} from "@/services/business-documents/pdf-layout";
import { BUSINESS_DOCUMENT_COLORS as COLORS } from "@/services/business-documents/pdf-theme";
import type { FinancialReportBreakdownItem, FinancialReportBusinessArea, FinancialReportOutstandingInvoice, FinancialReportTarget, MonthlyFinancialReportData } from "@/services/financial-reports/financial-report-service";

function addFooter(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  addBusinessDocumentFooter(ctx, {
    text: `Little London Play & Learn | ${report.reportMonthLabel} | Confidential Management Report`,
  });
}

function addHeader(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  addBusinessDocumentHeader(ctx, {
    title: "Monthly Financial Summary",
    titleX: 300,
    titleSize: 12,
    metaLines: [report.reportMonthLabel, `Generated: ${report.generatedDate}`, "Confidential Management Report"],
    metaSizes: [10, 8.5, 8.5],
    metaGap: 14,
    afterY: 690,
  });
}

function ensureSpace(ctx: PdfContext, needed: number, report: MonthlyFinancialReportData): void {
  ensureDocumentSpace(ctx, needed, () => {
    addFooter(ctx, report);
    ctx.page = ctx.doc.addPage();
    ctx.pageNumber += 1;
    addHeader(ctx, report);
  });
}

function sectionTitle(ctx: PdfContext, title: string, report: MonthlyFinancialReportData, needed = 44): void {
  ensureSpace(ctx, needed, report);
  drawSectionTitle(ctx, title);
}

function drawNarrative(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  sectionTitle(ctx, "Management Summary", report, 94);
  const lines = report.narrative.length > 0 ? report.narrative : ["No management summary is available for this month."];
  const boxHeight = 30 + lines.length * 14;

  ctx.doc.rect(ctx.page, 42, ctx.y - boxHeight, 511, boxHeight, COLORS.cream, COLORS.border);
  lines.forEach((line, index) => {
    wrapText(line, 475, 8.8).slice(0, 2).forEach((wrapped, lineIndex) => {
      ctx.doc.text(ctx.page, wrapped, 58, ctx.y - 20 - index * 14 - lineIndex * 10, 8.8, COLORS.navy);
    });
  });
  ctx.y -= boxHeight + 20;
}

function drawMetricGrid(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  sectionTitle(ctx, "Executive KPI Summary", report, 170);
  const summary = report.executiveSummary;
  const cards = [
    ["Invoice Payments", formatMoney(summary.invoicePaymentsReceived), "Received invoice payments only"],
    ["Cashbook Income", formatMoney(summary.cashbookIncome), "Daily income outside invoices"],
    ["Total Income", formatMoney(summary.totalIncome), "Received money only"],
    ["Total Expenses", formatMoney(summary.totalExpenses), "Recorded expenses"],
    ["Net Profit", formatMoney(summary.netProfit), "Income minus expenses"],
    ["Outstanding", formatMoney(summary.outstandingInvoiceBalance), `${summary.outstandingInvoiceCount} invoice(s)`],
    ["Profit Margin", `${summary.profitMargin}%`, "Net profit / total income"],
    ["Active Students", String(summary.activeStudentCount), "Current active students"],
  ];
  const cardWidth = 120;
  const cardHeight = 52;
  const gap = 10;
  const startX = 42;
  let x = startX;
  let y = ctx.y;

  cards.forEach(([label, value, helper], index) => {
    if (index === 4) {
      x = startX;
      y -= cardHeight + gap;
    }

    ctx.doc.rect(ctx.page, x, y - cardHeight, cardWidth, cardHeight, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, label, x + 10, y - 15, 7.5, COLORS.muted, "bold");
    ctx.doc.text(ctx.page, value, x + 10, y - 31, 10.5, label === "Net Profit" && summary.netProfit < 0 ? COLORS.coral : COLORS.navy, "bold");
    ctx.doc.text(ctx.page, helper, x + 10, y - 44, 6.8, COLORS.muted);
    x += cardWidth + gap;
  });

  ctx.y = y - cardHeight - 22;
}

function drawOverview(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  sectionTitle(ctx, "Income vs Expenses Overview", report, 116);
  drawOverviewCard(ctx, 42, ctx.y, 160, "Income", formatMoney(report.executiveSummary.totalIncome), report.comparisons.income.label);
  drawOverviewCard(ctx, 218, ctx.y, 160, "Expenses", formatMoney(report.executiveSummary.totalExpenses), report.comparisons.expenses.label);
  drawOverviewCard(ctx, 394, ctx.y, 159, "Net Profit", formatMoney(report.executiveSummary.netProfit), report.comparisons.profit.label);
  ctx.y -= 118;
}

function drawOverviewCard(ctx: PdfContext, x: number, y: number, width: number, title: string, currentValue: string, comparison: string): void {
  ctx.doc.rect(ctx.page, x, y - 94, width, 94, COLORS.cream, COLORS.border);
  ctx.doc.text(ctx.page, title, x + 12, y - 18, 10.5, COLORS.navy, "bold");
  ctx.doc.text(ctx.page, "This Month", x + 12, y - 45, 7.8, COLORS.muted, "bold");
  ctx.doc.text(ctx.page, currentValue, x + 12, y - 59, 9.2, COLORS.navy);
  ctx.doc.text(ctx.page, "Previous Month", x + 12, y - 76, 7.6, COLORS.muted, "bold");
  ctx.doc.text(ctx.page, comparison, x + 12, y - 87, 8, COLORS.navy);
}

function targetValue(target: FinancialReportTarget, type: "target" | "actual" | "percent"): string {
  if (target.targetValue === null) {
    return "Not set";
  }

  if (type === "percent") {
    return `${target.percentageAchieved ?? 0}%`;
  }

  const value = type === "target" ? target.targetValue : target.actualValue ?? 0;
  return target.type === "active_students" ? String(value) : formatMoney(value);
}

function drawTargets(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  sectionTitle(ctx, "Target Performance", report, 130);
  const tableX = 42;
  drawTableHeader(ctx, tableX, ctx.y, [
    { label: "Target", x: 52 },
    { label: "Target Value", x: 200 },
    { label: "Actual", x: 312 },
    { label: "%", x: 408 },
    { label: "Status", x: 462 },
  ]);
  ctx.y -= 28;

  report.targets.forEach((target) => {
    ensureSpace(ctx, 36, report);
    ctx.doc.rect(ctx.page, tableX, ctx.y - 30, 511, 30, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, target.label, 52, ctx.y - 18, 8.4, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, targetValue(target, "target"), 200, ctx.y - 18, 8.1, COLORS.navy);
    ctx.doc.text(ctx.page, targetValue(target, "actual"), 312, ctx.y - 18, 8.1, COLORS.navy);
    ctx.doc.text(ctx.page, targetValue(target, "percent"), 408, ctx.y - 18, 8.1, COLORS.navy);
    ctx.doc.text(ctx.page, target.status, 462, ctx.y - 18, 8.1, target.status === "At Risk" ? COLORS.coral : COLORS.sage, "bold");
    ctx.y -= 30;
  });
  ctx.y -= 18;
}

function drawBreakdownTable(ctx: PdfContext, title: string, rows: FinancialReportBreakdownItem[], report: MonthlyFinancialReportData, emptyText: string): void {
  sectionTitle(ctx, title, report, 80);
  const tableX = 42;
  drawTableHeader(ctx, tableX, ctx.y, [
    { label: "Name", x: 52 },
    { label: "Amount", x: 360 },
    { label: "Share", x: 470 },
  ]);
  ctx.y -= 28;

  if (rows.length === 0) {
    ctx.doc.rect(ctx.page, tableX, ctx.y - 30, 511, 30, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, emptyText, 52, ctx.y - 18, 8.5, COLORS.muted);
    ctx.y -= 48;
    return;
  }

  rows.slice(0, 8).forEach((row) => {
    ensureSpace(ctx, 34, report);
    ctx.doc.rect(ctx.page, tableX, ctx.y - 30, 511, 30, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, wrapText(row.label, 280, 8.3)[0] ?? row.label, 52, ctx.y - 18, 8.3, COLORS.navy);
    ctx.doc.text(ctx.page, formatMoney(row.amount), 360, ctx.y - 18, 8.1, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, `${row.percent}%`, 470, ctx.y - 18, 8.1, COLORS.muted);
    ctx.y -= 30;
  });
  ctx.y -= 18;
}

function drawIncomeAndExpenses(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  drawBreakdownTable(ctx, "Income Analysis", report.incomeAnalysis.byBusinessArea, report, "No income recorded for this month.");
  drawBreakdownTable(ctx, "Income by Payment Method", report.incomeAnalysis.byPaymentMethod, report, "No payment method income recorded.");
  drawBreakdownTable(ctx, "Expense Analysis", report.expenseAnalysis.byCategory, report, "No expenses recorded for this month.");

  sectionTitle(ctx, "Expense Highlights", report, 92);
  drawSummaryCard(ctx, 42, ctx.y, 248, 76, "Salary Total", [
    ["Aggregate Salary Expense", formatMoney(report.expenseAnalysis.salaryTotal)],
  ]);
  drawSummaryCard(ctx, 305, ctx.y, 248, 76, "Largest Expense", [
    [
      report.expenseAnalysis.largestExpenseCategory?.label ?? "Not recorded",
      report.expenseAnalysis.largestExpenseCategory ? formatMoney(report.expenseAnalysis.largestExpenseCategory.amount) : "No expenses",
    ],
  ]);
  ctx.y -= 100;
  drawBreakdownTable(ctx, "Expense by Payment Method", report.expenseAnalysis.byPaymentMethod, report, "No expense payment methods recorded.");
}

function drawOutstandingInvoices(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  sectionTitle(ctx, "Outstanding Invoices", report, 120);
  ctx.doc.text(ctx.page, `Outstanding balance: ${formatMoney(report.executiveSummary.outstandingInvoiceBalance)} | Count: ${report.executiveSummary.outstandingInvoiceCount} | Oldest: ${report.executiveSummary.oldestOutstandingInvoiceAgeDays ?? 0} days`, 42, ctx.y, 8.5, COLORS.muted);
  ctx.y -= 18;
  const tableX = 42;
  drawTableHeader(ctx, tableX, ctx.y, [
    { label: "Invoice", x: 52 },
    { label: "Parent / Student", x: 130 },
    { label: "Due", x: 286 },
    { label: "Paid", x: 354 },
    { label: "Balance", x: 430 },
  ]);
  ctx.y -= 28;

  if (report.outstandingInvoices.length === 0) {
    ctx.doc.rect(ctx.page, tableX, ctx.y - 30, 511, 30, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, "No outstanding invoices for this report.", 52, ctx.y - 18, 8.5, COLORS.muted);
    ctx.y -= 48;
    return;
  }

  report.outstandingInvoices.forEach((invoice: FinancialReportOutstandingInvoice) => {
    ensureSpace(ctx, 42, report);
    ctx.doc.rect(ctx.page, tableX, ctx.y - 38, 511, 38, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, invoice.invoiceNumber, 52, ctx.y - 16, 7.8, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, wrapText(`${invoice.parentName} / ${invoice.studentName}`, 145, 7.6)[0] ?? invoice.parentName, 130, ctx.y - 16, 7.6, COLORS.navy);
    ctx.doc.text(ctx.page, formatBusinessDate(invoice.dueDate), 286, ctx.y - 16, 7.5, COLORS.muted);
    ctx.doc.text(ctx.page, formatMoney(invoice.paid), 354, ctx.y - 16, 7.5, COLORS.navy);
    ctx.doc.text(ctx.page, formatMoney(invoice.balance), 430, ctx.y - 16, 7.5, COLORS.coral, "bold");
    ctx.doc.text(ctx.page, titleCase(invoice.status), 52, ctx.y - 30, 7, COLORS.muted);
    ctx.y -= 38;
  });
  ctx.y -= 18;
}

function drawBusinessAreaPerformance(ctx: PdfContext, report: MonthlyFinancialReportData): void {
  sectionTitle(ctx, "Business Area Performance", report, 120);
  ctx.doc.text(ctx.page, "Invoice payment income remains labelled as Invoice Income / Unassigned unless a reliable business-area mapping exists.", 42, ctx.y, 7.8, COLORS.muted);
  ctx.y -= 18;
  const tableX = 42;
  drawTableHeader(ctx, tableX, ctx.y, [
    { label: "Area", x: 52 },
    { label: "Income", x: 244 },
    { label: "Expenses", x: 330 },
    { label: "Profit", x: 418 },
    { label: "Margin", x: 500 },
  ]);
  ctx.y -= 28;

  if (report.businessAreas.length === 0) {
    ctx.doc.rect(ctx.page, tableX, ctx.y - 30, 511, 30, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, "No business-area activity recorded for this month.", 52, ctx.y - 18, 8.5, COLORS.muted);
    ctx.y -= 48;
    return;
  }

  report.businessAreas.slice(0, 10).forEach((area: FinancialReportBusinessArea) => {
    ensureSpace(ctx, 34, report);
    ctx.doc.rect(ctx.page, tableX, ctx.y - 30, 511, 30, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, wrapText(area.label, 175, 7.8)[0] ?? area.label, 52, ctx.y - 18, 7.8, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, formatMoney(area.income), 244, ctx.y - 18, 7.4, COLORS.navy);
    ctx.doc.text(ctx.page, formatMoney(area.expenses), 330, ctx.y - 18, 7.4, COLORS.navy);
    ctx.doc.text(ctx.page, formatMoney(area.profit), 418, ctx.y - 18, 7.4, area.profit >= 0 ? COLORS.sage : COLORS.coral, "bold");
    ctx.doc.text(ctx.page, area.profitMargin === null ? "n/a" : `${area.profitMargin}%`, 500, ctx.y - 18, 7.4, COLORS.muted);
    ctx.y -= 30;
  });
  ctx.y -= 18;
}

export function generateMonthlyFinancialSummaryPdf(report: MonthlyFinancialReportData): Buffer {
  const doc = new SimplePdfDocument({
    title: `Little London Monthly Financial Summary - ${report.reportMonth}`,
    author: "Little London Play & Learn",
  });
  const ctx: PdfContext = {
    doc,
    page: doc.addPage(),
    y: 0,
    pageNumber: 1,
  };

  addHeader(ctx, report);
  drawNarrative(ctx, report);
  drawMetricGrid(ctx, report);
  drawOverview(ctx, report);
  drawTargets(ctx, report);
  drawIncomeAndExpenses(ctx, report);
  drawOutstandingInvoices(ctx, report);
  drawBusinessAreaPerformance(ctx, report);
  addFooter(ctx, report);

  return doc.build();
}
