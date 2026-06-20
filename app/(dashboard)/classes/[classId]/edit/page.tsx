import Link from "next/link";
import { notFound } from "next/navigation";

import { ClassForm } from "@/components/academic/class-form";
import { Button } from "@/components/ui/button";
import { updateClassAction } from "@/features/academic/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageClasses, getClassDetail, listActiveCourses } from "@/services/academic/academic-service";

export const dynamic = "force-dynamic";

type EditClassPageProps = {
  params: Promise<{ classId: string }>;
};

export default async function EditClassPage({ params }: EditClassPageProps) {
  const profile = await requireUserProfile();
  const { classId } = await params;

  if (!canManageClasses(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can edit classes.</p>
        <Button asChild className="mt-6" variant="outline"><Link href={`/classes/${classId}`}>Back to class</Link></Button>
      </section>
    );
  }

  const [classItem, courses] = await Promise.all([getClassDetail(profile, classId), listActiveCourses()]);

  if (!classItem) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Edit class</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{classItem.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Update class details, capacity, and date range.</p>
      </section>
      <ClassForm action={updateClassAction.bind(null, classItem.id)} classItem={classItem} courses={courses} mode="edit" />
    </div>
  );
}
