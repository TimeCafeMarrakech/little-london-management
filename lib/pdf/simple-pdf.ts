const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

type PdfPage = {
  commands: string[];
};

export type PdfDocumentOptions = {
  title?: string;
  author?: string;
};

function escapeName(value: string): string {
  return value.replace(/[^\w\s-]/g, "").trim();
}

function pdfString(value: string): string {
  const safeValue = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

  return `(${safeValue})`;
}

function streamObject(content: string): string {
  const length = Buffer.byteLength(content, "utf8");

  return `<< /Length ${length} >>\nstream\n${content}\nendstream`;
}

export function rgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);

  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function color(hex: string): string {
  const [r, g, b] = rgb(hex);

  return `${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)}`;
}

export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  const estimatedCharWidth = fontSize * 0.52;
  const maxChars = Math.max(12, Math.floor(maxWidth / estimatedCharWidth));

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

export class SimplePdfDocument {
  readonly width = A4_WIDTH;
  readonly height = A4_HEIGHT;
  private readonly pages: PdfPage[] = [];
  private readonly options: PdfDocumentOptions;

  constructor(options: PdfDocumentOptions = {}) {
    this.options = options;
  }

  addPage(): PdfPage {
    const page = { commands: [] };
    this.pages.push(page);
    return page;
  }

  rect(page: PdfPage, x: number, y: number, width: number, height: number, fill: string, stroke?: string): void {
    page.commands.push(`q\n${color(fill)} rg\n${stroke ? `${color(stroke)} RG\n` : ""}${x} ${y} ${width} ${height} re ${stroke ? "B" : "f"}\nQ`);
  }

  line(page: PdfPage, x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1): void {
    page.commands.push(`q\n${color(stroke)} RG\n${width} w\n${x1} ${y1} m\n${x2} ${y2} l\nS\nQ`);
  }

  circle(page: PdfPage, cx: number, cy: number, radius: number, fill: string): void {
    const c = radius * 0.5522847498;
    page.commands.push(
      [
        "q",
        `${color(fill)} rg`,
        `${(cx + radius).toFixed(2)} ${cy.toFixed(2)} m`,
        `${(cx + radius).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx + c).toFixed(2)} ${(cy + radius).toFixed(2)} ${cx.toFixed(2)} ${(cy + radius).toFixed(2)} c`,
        `${(cx - c).toFixed(2)} ${(cy + radius).toFixed(2)} ${(cx - radius).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx - radius).toFixed(2)} ${cy.toFixed(2)} c`,
        `${(cx - radius).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx - c).toFixed(2)} ${(cy - radius).toFixed(2)} ${cx.toFixed(2)} ${(cy - radius).toFixed(2)} c`,
        `${(cx + c).toFixed(2)} ${(cy - radius).toFixed(2)} ${(cx + radius).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx + radius).toFixed(2)} ${cy.toFixed(2)} c`,
        "f",
        "Q",
      ].join("\n"),
    );
  }

  text(page: PdfPage, value: string, x: number, y: number, size: number, fill = "#0F2747", font: "regular" | "bold" = "regular"): void {
    const fontName = font === "bold" ? "F2" : "F1";
    page.commands.push(`BT\n/${fontName} ${size} Tf\n${color(fill)} rg\n1 0 0 1 ${x} ${y} Tm\n${pdfString(value)} Tj\nET`);
  }

  build(): Buffer {
    if (this.pages.length === 0) {
      this.addPage();
    }

    const objects: string[] = [];
    const addObject = (body: string) => {
      objects.push(body);
      return objects.length;
    };

    const catalogId = addObject("CATALOG");
    const pagesId = addObject("PAGES");
    const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const pageIds: number[] = [];

    this.pages.forEach((page) => {
      const content = page.commands.join("\n");
      const contentId = addObject(streamObject(content));
      const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4_WIDTH} ${A4_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    });

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

    const infoEntries = [
      this.options.title ? `/Title ${pdfString(escapeName(this.options.title))}` : null,
      this.options.author ? `/Author ${pdfString(escapeName(this.options.author))}` : null,
    ].filter(Boolean);
    const infoId = addObject(`<< ${infoEntries.join(" ")} >>`);

    let output = "%PDF-1.7\n";
    const offsets = [0];

    objects.forEach((body, index) => {
      offsets.push(Buffer.byteLength(output, "utf8"));
      output += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(output, "utf8");
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      output += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    });
    output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(output, "utf8");
  }
}
