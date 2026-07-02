import { SimplePdfDocument, wrapText } from "@/lib/pdf/simple-pdf";
import { BUSINESS_DOCUMENT_COLORS as COLORS } from "@/services/business-documents/pdf-theme";

export type PdfContext = {
  doc: SimplePdfDocument;
  page: ReturnType<SimplePdfDocument["addPage"]>;
  y: number;
  pageNumber: number;
};

type HeaderBadge = {
  label: string;
  x: number;
  y: number;
  width: number;
  fill: string;
  textColor: string;
};

type HeaderOptions = {
  title: string;
  metaLines: string[];
  titleX?: number;
  titleY?: number;
  titleSize?: number;
  metaStartY?: number;
  metaSize?: number;
  metaSizes?: number[];
  metaGap?: number;
  afterY?: number;
  badge?: HeaderBadge;
};

type FooterOptions = {
  text: string;
  textY?: number;
  pageNumberY?: number;
};

export function addLittleLondonLogo(ctx: PdfContext, cx = 62, cy = 792): void {
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

export function addBusinessDocumentHeader(ctx: PdfContext, options: HeaderOptions): void {
  const { doc, page } = ctx;
  const titleX = options.titleX ?? 318;
  const titleY = options.titleY ?? 803;
  const metaStartY = options.metaStartY ?? 784;
  const metaSize = options.metaSize ?? 10.5;
  const metaGap = options.metaGap ?? 16;

  doc.rect(page, 0, 0, doc.width, doc.height, COLORS.white);
  doc.rect(page, 0, 736, doc.width, 106, COLORS.cream);
  addLittleLondonLogo(ctx, 62, 792);
  doc.text(page, "LITTLE LONDON", 96, 805, 16, COLORS.coral, "bold");
  doc.text(page, "PLAY & LEARN", 98, 787, 9.5, COLORS.sage, "bold");
  doc.text(page, "Where Little Minds Grow", 98, 769, 10, COLORS.muted);

  doc.text(page, options.title, titleX, titleY, options.titleSize ?? 12.5, COLORS.navy, "bold");
  options.metaLines.forEach((line, index) => {
    doc.text(page, line, titleX, metaStartY - index * metaGap, options.metaSizes?.[index] ?? metaSize, COLORS.muted);
  });

  if (options.badge) {
    doc.rect(page, options.badge.x, options.badge.y, options.badge.width, 18, options.badge.fill, options.badge.fill);
    doc.text(page, options.badge.label, options.badge.x + 10, options.badge.y + 6, 8, options.badge.textColor, "bold");
  }

  doc.line(page, 42, 734, 553, 734, COLORS.coral, 2);
  ctx.y = options.afterY ?? 690;
}

export function addBusinessDocumentFooter(ctx: PdfContext, options: FooterOptions): void {
  const { doc, page } = ctx;

  doc.line(page, 42, 44, 553, 44, COLORS.border, 0.8);
  doc.text(page, options.text, 42, options.textY ?? 30, 8.5, COLORS.muted);
  doc.text(page, `Page ${ctx.pageNumber}`, 520, options.pageNumberY ?? 30, 8.5, COLORS.muted);
}

export function ensureDocumentSpace(ctx: PdfContext, needed: number, redrawPage: () => void): void {
  if (ctx.y - needed > 70) {
    return;
  }

  redrawPage();
}

export function drawSectionTitle(ctx: PdfContext, title: string, gap = 18): void {
  ctx.doc.text(ctx.page, title, 46, ctx.y, 13, COLORS.coral, "bold");
  ctx.y -= gap;
}

export function drawStatusBadge(ctx: PdfContext, badge: HeaderBadge): void {
  ctx.doc.rect(ctx.page, badge.x, badge.y, badge.width, 18, badge.fill, badge.fill);
  ctx.doc.text(ctx.page, badge.label, badge.x + 10, badge.y + 6, 8, badge.textColor, "bold");
}

export function drawSummaryCard(ctx: PdfContext, x: number, y: number, width: number, height: number, title: string, rows: Array<[string, string]>): void {
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

export function drawTableHeader(ctx: PdfContext, tableX: number, y: number, columns: Array<{ label: string; x: number }>): void {
  ctx.doc.rect(ctx.page, tableX, y - 24, 511, 28, COLORS.cream, COLORS.border);
  columns.forEach((column) => {
    ctx.doc.text(ctx.page, column.label, column.x, y - 13, 8.3, COLORS.muted, "bold");
  });
}
