import { ArrowRight } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { NotificationArea } from "@/components/dashboard/notification-area";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { dashboardExperiences, notificationItems, shellHighlights } from "@/lib/dashboard/data";
import type { UserProfile } from "@/lib/auth/types";

type DashboardContentProps = {
  profile: UserProfile;
};

export function DashboardContent({ profile }: DashboardContentProps) {
  const experience = dashboardExperiences[profile.role];
  const notifications = notificationItems[profile.role];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border bg-card shadow-soft">
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {shellHighlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold text-primary"
                    key={highlight.label}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {highlight.label}
                  </span>
                );
              })}
            </div>
            <p className="text-sm font-medium text-accent">Welcome, {profile.fullName}</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-normal text-foreground">{experience.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{experience.subtitle}</p>
            <p className="mt-5 max-w-2xl rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">{experience.focus}</p>
          </div>
          <NotificationArea items={notifications} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard highlights">
        {experience.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {experience.panels.map((panel) => (
          <DashboardCard key={panel.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{panel.eyebrow}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal">{panel.title}</h2>
            <div className="mt-5 space-y-3">
              {panel.items.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md bg-muted/45 px-4 py-3 text-sm">
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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Quick actions</p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal">Prepared for future modules</h2>
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
