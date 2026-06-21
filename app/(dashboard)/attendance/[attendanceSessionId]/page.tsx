import Link from "next/link";
import { notFound } from "next/navigation";

import { AttendanceDetailPanel } from "@/components/attendance/attendance-detail-panel";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import { canReadAttendance, getAttendanceSessionDetail } from "@/services/attendance/attendance-service";

export const dynamic = "force-dynamic";

type AttendanceSessionDetailPageProps = {
  params: Promise<{ attendanceSessionId: string }>;
};

export default async function AttendanceSessionDetailPage({ params }: AttendanceSessionDetailPageProps) {
  const profile = await requireUserProfile();
  const { attendanceSessionId } = await params;

  if (!canReadAttendance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to this attendance session.</p>
      </section>
    );
  }

  const session = await getAttendanceSessionDetail(profile, attendanceSessionId);

  if (!session) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{session.classCode} - {session.sessionDate}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{session.className}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {session.courseName} - {session.recordCount} students - {session.status}
            </p>
          </div>
          <Button asChild variant="outline"><Link href="/attendance">Back to attendance</Link></Button>
        </div>
      </section>
      <AttendanceDetailPanel session={session} />
    </div>
  );
}
