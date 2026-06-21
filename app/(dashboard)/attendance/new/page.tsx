import Link from "next/link";

import { AttendanceEmptyState } from "@/components/attendance/attendance-empty-state";
import { AttendanceSessionForm } from "@/components/attendance/attendance-session-form";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import { canCreateAttendance, listAttendanceClassOptions } from "@/services/attendance/attendance-service";

export const dynamic = "force-dynamic";

export default async function NewAttendanceSessionPage() {
  const profile = await requireUserProfile();

  if (!canCreateAttendance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to create attendance sessions.</p>
        <Button asChild className="mt-6" variant="outline"><Link href="/attendance">Back to attendance</Link></Button>
      </section>
    );
  }

  const classes = await listAttendanceClassOptions(profile);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">New attendance session</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create attendance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Choose a class and date. Active enrolled students will be loaded automatically.
        </p>
      </section>
      {classes.length > 0 ? (
        <AttendanceSessionForm classes={classes} />
      ) : (
        <AttendanceEmptyState description="No active classes with your attendance access are available yet." title="No classes available" />
      )}
    </div>
  );
}
