import Link from "next/link";

import { TeacherForm } from "@/components/teachers/teacher-form";
import { Button } from "@/components/ui/button";
import { createTeacherAction } from "@/features/teachers/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageTeachers } from "@/services/teachers/teacher-service";

export const dynamic = "force-dynamic";

export default async function NewTeacherPage() {
  const profile = await requireUserProfile();

  if (!canManageTeachers(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can create teacher profiles.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/teachers">Back to teachers</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">New teacher</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create teacher profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Add core staff details, qualifications, availability, and employment information.
        </p>
      </section>
      <TeacherForm action={createTeacherAction} mode="create" />
    </div>
  );
}
