import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { RegistrationFormActions } from "@/components/business-documents/registration-form-actions";
import { StudentDetailSections } from "@/components/students/student-detail-sections";
import { StudentStatusForm } from "@/components/students/student-status-form";
import { Button } from "@/components/ui/button";
import { updateStudentStatusAction } from "@/features/students/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { getRegistrationFormEmail, getRegistrationFormWhatsAppMessage } from "@/services/business-documents/messages";
import { canManageStudents, canReadStudentModule, getStudentDetail } from "@/services/students/student-service";

export const dynamic = "force-dynamic";

type StudentDetailPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

function formatRegistrationDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const profile = await requireUserProfile();
  const { studentId } = await params;

  if (!canReadStudentModule(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to the student management module.</p>
      </section>
    );
  }

  const student = await getStudentDetail(profile, studentId);

  if (!student) {
    notFound();
  }

  const canManage = canManageStudents(profile);
  const statusAction = updateStudentStatusAction.bind(null, student.id);
  const registrationEmail = getRegistrationFormEmail(student);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{student.studentNumber}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{student.fullName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {student.age} years old · {student.primaryLanguage ?? "Language not recorded"} · {student.status}
            </p>
          </div>
          {canManage ? (
            <Button asChild variant="outline">
              <Link href={`/students/${student.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit profile
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      {canManage ? <StudentStatusForm action={statusAction} student={student} /> : null}
      {canManage ? (
        <RegistrationFormActions
          emailBody={registrationEmail.body}
          emailSubject={registrationEmail.subject}
          registrationDate={formatRegistrationDate(student.createdAt)}
          studentId={student.id}
          studentName={student.fullName}
          whatsAppMessage={getRegistrationFormWhatsAppMessage(student)}
        />
      ) : null}
      <StudentDetailSections student={student} />
    </div>
  );
}
