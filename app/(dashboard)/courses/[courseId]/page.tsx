import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { AcademicEmptyState } from "@/components/academic/academic-empty-state";
import { ClassCard } from "@/components/academic/class-card";
import { AcademicStatusForm } from "@/components/academic/status-form";
import { Button } from "@/components/ui/button";
import { updateCourseStatusAction } from "@/features/academic/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageCourses, canReadAcademic, getCourseDetail } from "@/services/academic/academic-service";

export const dynamic = "force-dynamic";

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const profile = await requireUserProfile();
  const { courseId } = await params;

  if (!canReadAcademic(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to this course.</p>
      </section>
    );
  }

  const course = await getCourseDetail(profile, courseId);

  if (!course) {
    notFound();
  }

  const canManage = canManageCourses(profile);
  const statusAction = updateCourseStatusAction.bind(null, course.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{course.courseCode}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{course.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{course.description ?? "No course description recorded."}</p>
          </div>
          {canManage ? <Button asChild variant="outline"><Link href={`/courses/${course.id}/edit`}><Pencil className="h-4 w-4" aria-hidden="true" />Edit course</Link></Button> : null}
        </div>
      </section>
      {canManage ? <AcademicStatusForm action={statusAction} currentStatus={course.status} description="Archiving hides the course from daily lists while preserving linked classes." title="Archive / restore" /> : null}
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Linked classes</h2>
        <div className="mt-4">
          {course.classes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {course.classes.map((classItem) => <ClassCard classItem={classItem} key={classItem.id} />)}
            </div>
          ) : (
            <AcademicEmptyState actionHref={canManage ? "/classes/new" : undefined} actionLabel="Create class" description="Classes linked to this course will appear here." title="No classes yet" />
          )}
        </div>
      </section>
    </div>
  );
}
