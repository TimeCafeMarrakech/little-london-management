import { BriefcaseBusiness, GraduationCap, UserCheck, UserRoundX } from "lucide-react";

import type { TeacherDashboardMetrics } from "@/features/teachers/types";

type TeacherDashboardWidgetsProps = {
  metrics: TeacherDashboardMetrics;
};

const widgetStyles = [
  { label: "Total teachers", key: "totalTeachers", icon: GraduationCap, helper: "Teacher profiles", tone: "text-primary" },
  { label: "Active teachers", key: "activeTeachers", icon: UserCheck, helper: "Available for assignment", tone: "text-sky-600" },
  { label: "Part-time", key: "partTimeTeachers", icon: BriefcaseBusiness, helper: "Flexible capacity", tone: "text-accent" },
  { label: "Archived", key: "archivedTeachers", icon: UserRoundX, helper: "Hidden from daily views", tone: "text-muted-foreground" },
] as const;

export function TeacherDashboardWidgets({ metrics }: TeacherDashboardWidgetsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {widgetStyles.map((widget) => {
        const Icon = widget.icon;

        return (
          <section className="ll-card-premium p-5" key={widget.key}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{widget.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics[widget.key]}</p>
              </div>
              <div className="rounded-lg bg-muted/75 p-3 shadow-inner-soft">
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
