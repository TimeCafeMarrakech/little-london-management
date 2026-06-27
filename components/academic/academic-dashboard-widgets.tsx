import { BookOpen, GraduationCap, Layers3, UsersRound } from "lucide-react";

import type { AcademicDashboardMetrics } from "@/features/academic/types";

type AcademicDashboardWidgetsProps = {
  metrics: AcademicDashboardMetrics;
};

const widgets = [
  { key: "totalCourses", label: "Total courses", helper: "Program catalogue", icon: BookOpen, tone: "text-primary" },
  { key: "activeCourses", label: "Active courses", helper: "Open for classes", icon: BookOpen, tone: "text-[#54a878]" },
  { key: "totalClasses", label: "Total classes", helper: "Current class groups", icon: Layers3, tone: "text-primary" },
  { key: "activeClasses", label: "Active classes", helper: "Running now", icon: Layers3, tone: "text-[#54a878]" },
  { key: "classesNearCapacity", label: "Near capacity", helper: "80% or more filled", icon: UsersRound, tone: "text-accent" },
  { key: "totalEnrolments", label: "Total enrolments", helper: "Class memberships", icon: GraduationCap, tone: "text-primary" },
  { key: "activeEnrolments", label: "Active enrolments", helper: "Currently attending", icon: GraduationCap, tone: "text-[#54a878]" },
] as const;

export function AcademicDashboardWidgets({ metrics }: AcademicDashboardWidgetsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {widgets.map((widget) => {
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
