import Link from "next/link";
import { notFound } from "next/navigation";

import { StudentForm } from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
import { updateStudentAction } from "@/features/students/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageStudents, getStudentDetail } from "@/services/students/student-service";

export const dynamic = "force-dynamic";

type EditStudentPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const profile = await requireUserProfile();
  const { studentId } = await params;

  if (!canManageStudents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can edit student profiles.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href={`/students/${studentId}`}>Back to student</Link>
        </Button>
      </section>
    );
  }

  const student = await getStudentDetail(profile, studentId);

  if (!student) {
    notFound();
  }

  const action = updateStudentAction.bind(null, student.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Edit student</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{student.fullName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Update profile, medical, emergency, and relationship information.
        </p>
      </section>
      <StudentForm action={action} mode="edit" student={student} />
    </div>
  );
}
