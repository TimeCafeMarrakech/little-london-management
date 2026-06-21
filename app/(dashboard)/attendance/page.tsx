import Link from "next/link";

import { AttendanceDashboardWidgets } from "@/components/attendance/attendance-dashboard-widgets";
import { AttendanceEmptyState } from "@/components/attendance/attendance-empty-state";
import { AttendanceErrorState } from "@/components/attendance/attendance-error-state";
import { AttendanceFilters } from "@/components/attendance/attendance-filters";
import { AttendanceSessionCard } from "@/components/attendance/attendance-session-card";
import { Button } from "@/components/ui/button";
import { attendanceListQuerySchema } from "@/features/attendance/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canCreateAttendance, canReadAttendance, listAttendanceClassOptions, listAttendanceSessions } from "@/services/attendance/attendance-service";

export const dynamic = "force-dynamic";

type AttendancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const profile = await requireUserProfile();

  if (!canReadAttendance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to attendance management.</p>
      </section>
    );
  }

  const params = await searchParams;
  const filters = attendanceListQuerySchema.parse({
    query: getFirstParam(params.query),
    classId: getFirstParam(params.classId),
    status: getFirstParam(params.status),
    dateFrom: getFirstParam(params.dateFrom),
    dateTo: getFirstParam(params.dateTo),
    page: getFirstParam(params.page),
    pageSize: getFirstParam(params.pageSize),
    sort: getFirstParam(params.sort),
    direction: getFirstParam(params.direction),
  });
  const canCreate = canCreateAttendance(profile);

  try {
    const [result, classOptions] = await Promise.all([listAttendanceSessions(profile, filters), listAttendanceClassOptions(profile)]);

    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">Attendance management</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Attendance</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Track daily attendance from active class rosters, then submit, review, and lock records.
              </p>
            </div>
            {canCreate ? <Button asChild><Link href="/attendance/new">Create attendance session</Link></Button> : null}
          </div>
        </section>
        <AttendanceDashboardWidgets metrics={result.metrics} />
        <AttendanceFilters classes={classOptions} filters={filters} />
        {result.sessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.sessions.map((session) => <AttendanceSessionCard key={session.id} session={session} />)}
          </div>
        ) : (
          <AttendanceEmptyState actionHref={canCreate ? "/attendance/new" : undefined} actionLabel="Create session" description="Attendance sessions matching the current filters will appear here." title="No attendance sessions found" />
        )}
      </div>
    );
  } catch {
    return <AttendanceErrorState message="The Phase 8 Supabase migration may not be applied yet. Apply the attendance migration, then reload this page." />;
  }
}
