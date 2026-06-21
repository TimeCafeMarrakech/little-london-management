import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AttendanceSessionListItem } from "@/features/attendance/types";

type AttendanceSessionCardProps = {
  session: AttendanceSessionListItem;
};

export function AttendanceSessionCard({ session }: AttendanceSessionCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">{session.classCode}</p>
          <h2 className="mt-2 text-xl font-semibold">{session.className}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{session.courseName}</p>
        </div>
        <span className="rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold capitalize text-primary">{session.status}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />{session.sessionDate}</p>
        <p>{session.recordCount} students - {session.presentCount} present - {session.absentCount} absent - {session.lateCount} late</p>
      </div>
      <Button asChild className="mt-5" variant="outline"><Link href={`/attendance/${session.id}`}>Open session</Link></Button>
    </article>
  );
}
