import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseForm } from "@/components/academic/course-form";
import { Button } from "@/components/ui/button";
import { updateCourseAction } from "@/features/academic/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageCourses, getCourseDetail } from "@/services/academic/academic-service";

export const dynamic = "force-dynamic";

type EditCoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const profile = await requireUserProfile();
  const { courseId } = await params;

  if (!canManageCourses(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can edit courses.</p>
        <Button asChild className="mt-6" variant="outline"><Link href={`/courses/${courseId}`}>Back to course</Link></Button>
      </section>
    );
  }

  const course = await getCourseDetail(profile, courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Edit course</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{course.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Update course details and availability.</p>
      </section>
      <CourseForm action={updateCourseAction.bind(null, course.id)} course={course} mode="edit" />
    </div>
  );
}
