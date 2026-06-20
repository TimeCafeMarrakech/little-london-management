import Link from "next/link";

import { TeacherDashboardWidgets } from "@/components/teachers/teacher-dashboard-widgets";
import { TeacherEmptyState } from "@/components/teachers/teacher-empty-state";
import { TeacherErrorState } from "@/components/teachers/teacher-error-state";
import { TeacherFilters } from "@/components/teachers/teacher-filters";
import { TeacherProfileCard } from "@/components/teachers/teacher-profile-card";
import { Button } from "@/components/ui/button";
import { teacherListQuerySchema } from "@/features/teachers/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageTeachers, canReadTeacherModule, listTeachers } from "@/services/teachers/teacher-service";

export const dynamic = "force-dynamic";

type TeachersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TeachersPage({ searchParams }: TeachersPageProps) {
  const profile = await requireUserProfile();

  if (!canReadTeacherModule(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to the teacher management module.</p>
      </section>
    );
  }

  const params = await searchParams;
  const filters = teacherListQuerySchema.parse({
    query: getFirstParam(params.query),
    status: getFirstParam(params.status),
    employmentType: getFirstParam(params.employmentType),
    page: getFirstParam(params.page),
    pageSize: getFirstParam(params.pageSize),
    sort: getFirstParam(params.sort),
    direction: getFirstParam(params.direction),
  });
  const canManage = canManageTeachers(profile);

  try {
    const result = await listTeachers(profile, filters);

    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">Teacher management</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Teaching team</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Manage teacher profiles, availability, qualifications, and employment information.
              </p>
            </div>
            {canManage ? (
              <Button asChild>
                <Link href="/teachers/new">Create teacher</Link>
              </Button>
            ) : null}
          </div>
        </section>

        <TeacherDashboardWidgets metrics={result.metrics} />
        {canManage ? <TeacherFilters filters={filters} /> : null}

        {result.teachers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.teachers.map((teacher) => (
              <TeacherProfileCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        ) : (
          <TeacherEmptyState canManage={canManage} />
        )}
      </div>
    );
  } catch (error) {
    const message = error instanceof Error && error.message.includes("relation")
      ? "The Phase 6 Supabase migration has not been applied yet. Apply the teacher management migration, then reload this page."
      : "Please try again or contact an administrator if the problem continues.";

    return <TeacherErrorState message={message} />;
  }
}
