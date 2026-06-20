import Link from "next/link";

import { CourseForm } from "@/components/academic/course-form";
import { Button } from "@/components/ui/button";
import { createCourseAction } from "@/features/academic/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageCourses } from "@/services/academic/academic-service";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const profile = await requireUserProfile();

  if (!canManageCourses(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can create courses.</p>
        <Button asChild className="mt-6" variant="outline"><Link href="/courses">Back to courses</Link></Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">New course</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create course</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Add a course that classes can be created from.</p>
      </section>
      <CourseForm action={createCourseAction} mode="create" />
    </div>
  );
}
