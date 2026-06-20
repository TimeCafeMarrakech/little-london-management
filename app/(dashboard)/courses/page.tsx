import Link from "next/link";

import { AcademicDashboardWidgets } from "@/components/academic/academic-dashboard-widgets";
import { AcademicEmptyState } from "@/components/academic/academic-empty-state";
import { AcademicErrorState } from "@/components/academic/academic-error-state";
import { AcademicFilters } from "@/components/academic/academic-filters";
import { CourseCard } from "@/components/academic/course-card";
import { Button } from "@/components/ui/button";
import { academicListQuerySchema } from "@/features/academic/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageCourses, canReadAcademic, listCourses } from "@/services/academic/academic-service";

export const dynamic = "force-dynamic";

type CoursesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const profile = await requireUserProfile();

  if (!canReadAcademic(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to academic management.</p>
      </section>
    );
  }

  const params = await searchParams;
  const filters = academicListQuerySchema.parse({
    query: getFirstParam(params.query),
    status: getFirstParam(params.status),
    page: getFirstParam(params.page),
    pageSize: getFirstParam(params.pageSize),
    sort: getFirstParam(params.sort),
    direction: getFirstParam(params.direction),
  });
  const canManage = canManageCourses(profile);

  try {
    const result = await listCourses(profile, filters);

    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">Course management</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Courses</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Build the Little London course catalogue that future classes, enrolments, and schedules sit on top of.
              </p>
            </div>
            {canManage ? <Button asChild><Link href="/courses/new">Create course</Link></Button> : null}
          </div>
        </section>
        <AcademicDashboardWidgets metrics={result.metrics} />
        {canManage ? <AcademicFilters filters={filters} placeholder="Search courses" sortOptions={[
          { value: "created_at", label: "Created" },
          { value: "name", label: "Name" },
          { value: "course_code", label: "Course code" },
          { value: "status", label: "Status" },
        ]} /> : null}
        {result.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.items.map((course) => <CourseCard course={course} key={course.id} />)}
          </div>
        ) : (
          <AcademicEmptyState actionHref={canManage ? "/courses/new" : undefined} actionLabel="Create course" description="Courses matching the current filters will appear here." title="No courses found" />
        )}
      </div>
    );
  } catch {
    return <AcademicErrorState message="The Phase 7 Supabase migration may not be applied yet. Apply the courses/classes migration, then reload this page." />;
  }
}
