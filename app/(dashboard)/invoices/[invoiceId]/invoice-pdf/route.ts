import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { generateInvoicePdf, getInvoiceDocumentData } from "@/services/business-documents/invoice-pdf";
import { canManageFinance } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

type InvoicePdfRouteProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

function safeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(request: NextRequest, { params }: InvoicePdfRouteProps) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

  if (!canManageFinance(profile)) {
    return NextResponse.json({ message: "Only Super Admin and Admin users can generate invoice PDFs." }, { status: 403 });
  }

  const { invoiceId } = await params;
  const invoice = await getInvoiceDocumentData(profile, invoiceId);

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
  }

  const pdf = generateInvoicePdf(invoice);
  const body = new ArrayBuffer(pdf.byteLength);
  new Uint8Array(body).set(pdf);
  const download = request.nextUrl.searchParams.get("download") === "1";
  const fileName = `little-london-invoice-${safeFileName(invoice.invoiceNumber)}-${safeFileName(invoice.studentName)}.pdf`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
