import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { generateRegistrationFormPdf } from "@/services/business-documents/registration-form-pdf";
import { canManageStudents, getStudentDetail } from "@/services/students/student-service";

export const dynamic = "force-dynamic";

type RegistrationFormRouteProps = {
  params: Promise<{
    studentId: string;
  }>;
};

function safeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

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
  const body = new ArrayBuffer(pdf.byteLength);
  new Uint8Array(body).set(pdf);
  const download = request.nextUrl.searchParams.get("download") === "1";
  const fileName = `little-london-registration-${safeFileName(student.fullName)}.pdf`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
