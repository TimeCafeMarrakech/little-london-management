import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { safeFileName } from "@/services/business-documents/pdf-formatters";
import { createBusinessPdfResponse } from "@/services/business-documents/pdf-route";
import { canViewFinancialReports, getMonthlyFinancialReportData, normalizeFinancialReportMonth } from "@/services/financial-reports/financial-report-service";
import { generateMonthlyFinancialSummaryPdf } from "@/services/financial-reports/monthly-financial-summary-pdf";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

  if (!canViewFinancialReports(profile)) {
    return NextResponse.json({ message: "Only Super Admin and Admin users can generate financial reports." }, { status: 403 });
  }

  let month: string;

  try {
    month = normalizeFinancialReportMonth(request.nextUrl.searchParams.get("month"));
  } catch {
    return NextResponse.json({ message: "Choose a valid report month in YYYY-MM format." }, { status: 400 });
  }

  const report = await getMonthlyFinancialReportData(profile, month);
  const pdf = generateMonthlyFinancialSummaryPdf(report);
  const fileName = `little-london-monthly-financial-summary-${safeFileName(report.reportMonth)}.pdf`;

  return createBusinessPdfResponse(request, pdf, fileName);
}
