import { ClipboardCheck, Clock, Percent, UserCheck, UserX } from "lucide-react";

import type { AttendanceMetrics } from "@/features/attendance/types";

type AttendanceDashboardWidgetsProps = {
  metrics: AttendanceMetrics;
};

export function AttendanceDashboardWidgets({ metrics }: AttendanceDashboardWidgetsProps) {
  const widgets = [
    { label: "Today's sessions", value: metrics.todaysSessions, helper: "Attendance sessions today", icon: ClipboardCheck, tone: "text-primary" },
    { label: "Present", value: metrics.presentCount, helper: "Marked present today", icon: UserCheck, tone: "text-sky-600" },
    { label: "Absent", value: metrics.absentCount, helper: "Marked absent today", icon: UserX, tone: "text-accent" },
    { label: "Late", value: metrics.lateCount, helper: "Late arrivals today", icon: Clock, tone: "text-primary" },
    { label: "Completion", value: `${metrics.completionRate}%`, helper: `${metrics.pendingSessions} pending`, icon: Percent, tone: "text-sky-600" },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {widgets.map((widget) => {
        const Icon = widget.icon;

        return (
          <section className="rounded-lg border bg-card p-5 shadow-soft" key={widget.label}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{widget.label}</p>
                <p className="mt-2 text-3xl font-semibold">{widget.value}</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <Icon className={`h-5 w-5 ${widget.tone}`} aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{widget.helper}</p>
          </section>
        );
      })}
    </div>
  );
}
