import { ArrowRight, CalendarDays, ClipboardCheck, Sparkles, UserRoundCheck, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { NotificationArea } from "@/components/dashboard/notification-area";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { dashboardExperiences, notificationItems, shellHighlights } from "@/lib/dashboard/data";
import type { UserProfile } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type DashboardContentProps = {
  profile: UserProfile;
};

const heroPulse = [
  { label: "Today's classes", value: "12", helper: "Across English, drama, and early years", icon: CalendarDays },
  { label: "Today's attendance", value: "94%", helper: "Calm check-ins in progress", icon: ClipboardCheck },
  { label: "Outstanding invoices", value: "18", helper: "Awaiting parent follow-up", icon: WalletCards },
  { label: "Upcoming workshops", value: "6", helper: "Holiday and weekend sessions", icon: Sparkles },
  { label: "Staff availability", value: "Healthy", helper: "No coverage gaps flagged", icon: UserRoundCheck },
];

const dashboardSections = [
  {
    label: "Operations",
    title: "Daily school rhythm",
    description: "Classes, attendance, staffing, and the gentle flow of the day.",
    tone: "bg-primary",
  },
  {
    label: "Learning",
    title: "Child-centred progress",
    description: "A clear view of students, teachers, courses, and class experiences.",
    tone: "bg-secondary",
  },
  {
    label: "Finance",
    title: "Confident billing",
    description: "Invoices, payments, and balances presented with calm clarity.",
    tone: "bg-accent",
  },
  {
    label: "Events",
    title: "Boutique activities",
    description: "Workshops, holiday camps, and birthday events with capacity awareness.",
    tone: "bg-muted",
  },
];

const chartBars = [
  { label: "Classes", value: "78%", className: "bg-primary" },
  { label: "Attendance", value: "94%", className: "bg-secondary" },
  { label: "Finance", value: "68%", className: "bg-accent" },
];

export function DashboardContent({ profile }: DashboardContentProps) {
  const experience = dashboardExperiences[profile.role];
  const notifications = notificationItems[profile.role];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-primary/10 bg-primary shadow-premium">
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {shellHighlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-primary-foreground/80"
                    key={highlight.label}
                  >
                    <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {highlight.label}
                  </span>
                );
              })}
            </div>
            <p className="text-sm font-medium text-accent">Welcome back, Noura 🌿</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-primary-foreground md:text-5xl">
              Little London Operations Centre
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/75">{experience.subtitle}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {heroPulse.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 shadow-inner-soft" key={item.label}>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-primary-foreground">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-primary-foreground/60">{item.helper}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <NotificationArea items={notifications} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard highlights">
        {experience.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard sections">
        {dashboardSections.map((section) => (
          <section className="ll-card-premium p-5" key={section.label}>
            <span className={cn("mb-5 block h-1.5 w-16 rounded-full", section.tone)} aria-hidden="true" />
            <p className="ll-section-label">{section.label}</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.description}</p>
          </section>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard>
          <p className="ll-section-label">Performance</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Calm operational signals</h2>
          <div className="mt-6 space-y-5">
            {chartBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{bar.label}</span>
                  <span className="text-muted-foreground">{bar.value}</span>
                </div>
                <div className="h-3 rounded-full bg-muted/70">
                  <div className={cn("h-3 rounded-full", bar.className)} style={{ width: bar.value }} />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {experience.panels.map((panel) => (
          <DashboardCard key={panel.title}>
            <p className="ll-section-label">{panel.eyebrow}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{panel.title}</h2>
            <div className="mt-5 space-y-3">
              {panel.items.map((item) => (
                <div key={item} className="ll-list-row flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        ))}
      </section>

      <DashboardCard>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="ll-section-label">Quick actions</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Prepared for future modules</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              These are non-functional placeholders so Phase 3 can show workflow shape without building later modules.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {experience.quickActions.map((action) => (
              <Button key={action} type="button" variant="outline">
                {action}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ))}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
