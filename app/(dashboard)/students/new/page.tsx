import Link from "next/link";

import { StudentForm } from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
import { createStudentAction } from "@/features/students/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageStudents } from "@/services/students/student-service";

export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const profile = await requireUserProfile();

  if (!canManageStudents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can create student profiles.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/students">Back to students</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">New student</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create student profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Add the core child record, care information, emergency contact, and first parent relationship snapshot.
        </p>
      </section>
      <StudentForm action={createStudentAction} mode="create" />
    </div>
  );
}
