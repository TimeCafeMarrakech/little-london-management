import Link from "next/link";

import { ClassForm } from "@/components/academic/class-form";
import { Button } from "@/components/ui/button";
import { createClassAction } from "@/features/academic/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageClasses, listActiveCourses } from "@/services/academic/academic-service";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  const profile = await requireUserProfile();

  if (!canManageClasses(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can create classes.</p>
        <Button asChild className="mt-6" variant="outline"><Link href="/classes">Back to classes</Link></Button>
      </section>
    );
  }

  const courses = await listActiveCourses();

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">New class</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create class</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Create a class from an active course, then assign teachers and enrol students.</p>
      </section>
      <ClassForm action={createClassAction} courses={courses} mode="create" />
    </div>
  );
}
