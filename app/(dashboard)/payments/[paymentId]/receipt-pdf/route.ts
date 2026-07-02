import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { safeFileName } from "@/services/business-documents/pdf-formatters";
import { createBusinessPdfResponse } from "@/services/business-documents/pdf-route";
import { generateReceiptPdf, getReceiptDocumentData } from "@/services/business-documents/receipt-pdf";
import { canManageFinance } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

type ReceiptPdfRouteProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: ReceiptPdfRouteProps) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

  if (!canManageFinance(profile)) {
    return NextResponse.json({ message: "Only Super Admin and Admin users can generate receipt PDFs." }, { status: 403 });
  }

  const { paymentId } = await params;
  const receipt = await getReceiptDocumentData(profile, paymentId);

  if (!receipt) {
    return NextResponse.json({ message: "Payment not found." }, { status: 404 });
  }

  const pdf = generateReceiptPdf(receipt);
  const fileName = `little-london-receipt-${safeFileName(receipt.paymentNumber)}-${safeFileName(receipt.studentName)}.pdf`;

  return createBusinessPdfResponse(request, pdf, fileName);
}
