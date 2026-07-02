import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { safeFileName } from "@/services/business-documents/pdf-formatters";
import { createBusinessPdfResponse } from "@/services/business-documents/pdf-route";
import { generateRegistrationFormPdf } from "@/services/business-documents/registration-form-pdf";
import { canManageStudents, getStudentDetail } from "@/services/students/student-service";

export const dynamic = "force-dynamic";

type RegistrationFormRouteProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RegistrationFormRouteProps) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  }

  if (!canManageStudents(profile)) {
    return NextResponse.json({ message: "Only Super Admin and Admin users can generate registration forms." }, { status: 403 });
  }

  const { studentId } = await params;
  const student = await getStudentDetail(profile, studentId);

  if (!student) {
    return NextResponse.json({ message: "Student not found." }, { status: 404 });
  }

  const pdf = generateRegistrationFormPdf(student);
  const fileName = `little-london-registration-${safeFileName(student.fullName)}.pdf`;

  return createBusinessPdfResponse(request, pdf, fileName);
}
