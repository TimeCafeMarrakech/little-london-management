import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  FilePlus2,
  GraduationCap,
  Sparkles,
  UserPlus,
  WalletCards,
} from "lucide-react";

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
  { label: "Upcoming events", value: "6", helper: "Holiday and weekend sessions", icon: Sparkles },
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

const analyticsWidgets = [
  {
    label: "Attendance trend",
    value: "94%",
    helper: "Strong completion across today's sessions",
    points: [82, 84, 87, 86, 90, 92, 94],
    color: "stroke-primary",
    icon: ClipboardCheck,
  },
  {
    label: "Enrolment trend",
    value: "+24",
    helper: "New enrolments this month",
    points: [18, 19, 20, 21, 22, 23, 24],
    color: "stroke-secondary",
    icon: GraduationCap,
  },
  {
    label: "Revenue trend",
    value: "86k MAD",
    helper: "Revenue pacing above last month",
    points: [42, 45, 47, 54, 58, 63, 69],
    color: "stroke-accent",
    icon: BarChart3,
  },
];

const upcomingEvents = [
  { title: "Spring Drama Workshop", meta: "Tomorrow, 10:00", capacity: "18/24" },
  { title: "Holiday Camp Preview", meta: "Fri, 14:30", capacity: "21/28" },
  { title: "Birthday Party Booking", meta: "Sat, 12:00", capacity: "12/16" },
];

const outstandingInvoices = [
  { family: "Benali family", amount: "2,400 MAD", status: "Due this week" },
  { family: "Haddad family", amount: "1,800 MAD", status: "Reminder ready" },
  { family: "Martin family", amount: "950 MAD", status: "Partially paid" },
];

const quickActions = [
  { label: "Add Student", helper: "Prepare a new child profile", icon: UserPlus },
  { label: "Create Invoice", helper: "Start a billing draft", icon: FilePlus2 },
  { label: "Mark Attendance", helper: "Open today's attendance flow", icon: ClipboardCheck },
  { label: "Create Event", helper: "Plan a workshop or camp", icon: CalendarDays },
];

function trendPoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 160;
      const y = 56 - ((value - min) / range) * 44;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

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
            <p className="text-sm font-medium text-accent">Welcome back, Noura</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-primary-foreground md:text-5xl">
              Little London Operations Centre
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/75">{experience.subtitle}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

        <DashboardCard>
          <p className="ll-section-label">Upcoming events</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Workshops and special bookings</h2>
          <div className="mt-5 space-y-3">
            {upcomingEvents.map((event) => (
              <div className="ll-list-row flex items-center justify-between gap-4 text-sm" key={event.title}>
                <div>
                  <p className="font-semibold text-foreground">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{event.meta}</p>
                </div>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-primary">{event.capacity}</span>
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

      <section className="grid gap-5 xl:grid-cols-3" aria-label="Analytics widgets">
        {analyticsWidgets.map((widget) => {
          const Icon = widget.icon;

          return (
            <DashboardCard key={widget.label}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="ll-section-label">{widget.label}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{widget.value}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{widget.helper}</p>
                </div>
                <span className="rounded-xl bg-muted/75 p-3 text-primary shadow-inner-soft">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <svg className="mt-6 h-24 w-full" viewBox="0 0 160 64" preserveAspectRatio="none" role="img" aria-label={`${widget.label} chart`}>
                <polyline
                  className={cn("fill-none stroke-[4]", widget.color)}
                  points={trendPoints(widget.points)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </DashboardCard>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <DashboardCard>
          <p className="ll-section-label">Outstanding invoices</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Finance follow-up</h2>
          <div className="mt-5 space-y-3">
            {outstandingInvoices.map((invoice) => (
              <div className="ll-list-row flex items-center justify-between gap-4 text-sm" key={invoice.family}>
                <div>
                  <p className="font-semibold text-foreground">{invoice.family}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{invoice.status}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{invoice.amount}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard>
          <p className="ll-section-label">Operational alerts</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">What needs calm attention</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { label: "Attendance", value: "2 sessions pending", tone: "bg-secondary/25" },
              { label: "Finance", value: "6 invoices due soon", tone: "bg-accent/20" },
              { label: "Events", value: "1 event near capacity", tone: "bg-muted" },
            ].map((alert) => (
              <div className={cn("rounded-xl border border-border/70 p-4 shadow-inner-soft", alert.tone)} key={alert.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{alert.label}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{alert.value}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>

      <DashboardCard>
        <div className="flex flex-col gap-5">
          <div>
            <p className="ll-section-label">Quick actions</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Frequent operations</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Presentation-only action cards for the core operations team.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Button className="h-auto justify-start p-4 text-left" key={action.label} type="button" variant="outline">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{action.label}</span>
                    <span className="mt-1 block whitespace-normal text-xs font-medium text-muted-foreground">{action.helper}</span>
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0" aria-hidden="true" />
                </Button>
              );
            })}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
