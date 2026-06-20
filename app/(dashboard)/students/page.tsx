import Link from "next/link";
import { Plus } from "lucide-react";

import { StudentDashboardWidgets } from "@/components/students/student-dashboard-widgets";
import { StudentEmptyState } from "@/components/students/student-empty-state";
import { StudentErrorState } from "@/components/students/student-error-state";
import { StudentFilters } from "@/components/students/student-filters";
import { StudentProfileCard } from "@/components/students/student-profile-card";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageStudents, canReadStudentModule, listStudents } from "@/services/students/student-service";
import { studentListQuerySchema } from "@/features/students/schemas";

export const dynamic = "force-dynamic";

type StudentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const profile = await requireUserProfile();

  if (!canReadStudentModule(profile)) {
    return (
      <StudentErrorState
        title="Access denied"
        message="Student management is available to Super Admins and Admins. Teacher assignment visibility is prepared, and parents use the parent portal instead."
      />
    );
  }

  const rawSearchParams = (await searchParams) ?? {};
  const filters = studentListQuerySchema.parse({
    query: firstValue(rawSearchParams.query),
    status: firstValue(rawSearchParams.status),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
    sort: firstValue(rawSearchParams.sort),
    direction: firstValue(rawSearchParams.direction),
  });

  try {
    const result = await listStudents(profile, filters);
    const canCreate = canManageStudents(profile);
    const teacherMode = profile.role === "teacher" && !canCreate;

    return (
      <div className="space-y-7">
        <section className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Phase 4</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Student management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage child profiles, medical notes, emergency contacts, parent relationship snapshots, and student status.
            </p>
          </div>
          {canCreate ? (
            <Button asChild>
              <Link href="/students/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create student
              </Link>
            </Button>
          ) : null}
        </section>

        <StudentDashboardWidgets metrics={result.metrics} />
        <StudentFilters filters={filters} />

        {result.students.length > 0 ? (
          <section className="grid gap-5 xl:grid-cols-2" aria-label="Student profiles">
            {result.students.map((student) => (
              <StudentProfileCard key={student.id} student={student} />
            ))}
          </section>
        ) : (
          <StudentEmptyState canCreate={canCreate} teacherMode={teacherMode} />
        )}

        {result.totalPages > 1 ? (
          <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span>
              Page {result.page} of {result.totalPages}
            </span>
            <span>{result.totalRecords} records</span>
          </div>
        ) : null}
      </div>
    );
  } catch (error) {
    return (
      <StudentErrorState
        message={
          error instanceof Error && error.message.includes("relation")
            ? "The Phase 4 Supabase migration has not been applied yet. Apply the student management migration, then reload this page."
            : "Students could not be loaded. Please check the database connection and permissions."
        }
      />
    );
  }
}
