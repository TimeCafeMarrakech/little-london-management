import Image from "next/image";
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
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/auth/types";
import { dashboardExperiences, notificationItems, shellHighlights } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

type DashboardContentProps = {
  profile: UserProfile;
};

const heroPulse = [
  { label: "Today's Classes", value: "12", helper: "English, drama, and early years", icon: CalendarDays, tone: "coral" },
  { label: "Today's Attendance", value: "94%", helper: "Calm check-ins in progress", icon: ClipboardCheck, tone: "sage" },
  { label: "Outstanding Invoices", value: "18", helper: "Awaiting parent follow-up", icon: WalletCards, tone: "yellow" },
  { label: "Upcoming Events", value: "6", helper: "Holiday and weekend sessions", icon: Sparkles, tone: "mint" },
] as const;

const analyticsWidgets = [
  {
    label: "Attendance trend",
    value: "94%",
    helper: "Strong completion across today's sessions",
    points: [82, 84, 87, 86, 90, 92, 94],
    color: "stroke-[#8cc9a8]",
    fill: "fill-[#8cc9a8]/10",
    icon: ClipboardCheck,
  },
  {
    label: "Enrolment trend",
    value: "+24",
    helper: "New enrolments this month",
    points: [18, 19, 20, 21, 22, 23, 24],
    color: "stroke-[#f24a3a]",
    fill: "fill-[#f24a3a]/10",
    icon: GraduationCap,
  },
  {
    label: "Revenue trend",
    value: "86k MAD",
    helper: "Revenue pacing above last month",
    points: [42, 45, 47, 54, 58, 63, 69],
    color: "stroke-[#d6b36a]",
    fill: "fill-[#d6b36a]/15",
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

const kpiToneClasses: Record<(typeof heroPulse)[number]["tone"], { card: string; icon: string; blob: string }> = {
  coral: {
    card: "bg-white/90 text-[#0f2d47]",
    icon: "bg-[#f24a3a]/12 text-[#f24a3a]",
    blob: "bg-[#f24a3a]/8",
  },
  sage: {
    card: "bg-white/90 text-[#0f2d47]",
    icon: "bg-[#8cc9a8]/30 text-[#0f2d47]",
    blob: "bg-[#8cc9a8]/25",
  },
  yellow: {
    card: "bg-white/90 text-[#0f2d47]",
    icon: "bg-[#d6b36a]/25 text-[#0f2d47]",
    blob: "bg-[#d6b36a]/20",
  },
  mint: {
    card: "bg-white/90 text-[#0f2d47]",
    icon: "bg-[#f24a3a]/10 text-[#f24a3a]",
    blob: "bg-[#f24a3a]/8",
  },
};

const kpiLabelClasses: Record<(typeof heroPulse)[number]["tone"], string> = {
  coral: "text-[#f24a3a]",
  sage: "text-[#54a878]",
  yellow: "text-[#d89d1d]",
  mint: "text-[#f24a3a]",
};

function trendPoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 180;
      const y = 68 - ((value - min) / range) * 50;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function trendFillPoints(values: number[]): string {
  return `0,76 ${trendPoints(values)} 180,76`;
}

export function DashboardContent({ profile }: DashboardContentProps) {
  const experience = dashboardExperiences[profile.role];
  const notifications = notificationItems[profile.role];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.68fr]">
        <div className="relative min-h-[340px] overflow-hidden rounded-[1.6rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_25px_70px_rgba(15,45,71,0.09)] lg:p-8">
          <div className="absolute -left-20 -top-24 h-52 w-52 rounded-full bg-[#f24a3a]/12" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 h-72 w-[48%] rounded-tl-full bg-[#8cc9a8]/28" aria-hidden="true" />
          <div className="absolute bottom-4 right-24 h-16 w-16 rounded-full bg-[#d6b36a]/18" aria-hidden="true" />

          <div className="relative z-10 flex min-h-[276px] max-w-[58%] flex-col justify-center max-lg:max-w-none">
            <div className="mb-8 flex flex-wrap gap-2">
                {shellHighlights.map((highlight) => {
                  const Icon = highlight.icon;

                  return (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#0f2d47] shadow-inner-soft"
                      key={highlight.label}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#f24a3a]" aria-hidden="true" />
                      {highlight.label}
                    </span>
                  );
                })}
              </div>
              <p className="whitespace-nowrap text-base font-semibold text-[#f24a3a]">Welcome back, Noura</p>
              <h1 className="mt-3 text-[2.65rem] font-bold leading-[1.08] tracking-tight text-[#0f2d47] xl:text-[3.35rem]">
                <span className="block whitespace-nowrap">Little London</span>
                <span className="block whitespace-nowrap">Operations Centre</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#5b6f82]">{experience.subtitle}</p>
          </div>

          <div className="absolute inset-y-0 right-0 hidden w-[47%] overflow-hidden lg:block">
              <div className="absolute left-[72%] top-0 z-20 h-20 w-1 -translate-x-1/2 bg-[#f24a3a]" aria-hidden="true" />
              <div className="absolute left-[72%] top-[4.5rem] z-20 h-12 w-20 -translate-x-1/2 rounded-b-full rounded-t-md bg-[#f24a3a] shadow-[0_14px_24px_rgba(242,74,58,0.28)]" aria-hidden="true">
                <span className="absolute bottom-0 left-1/2 h-3 w-12 -translate-x-1/2 rounded-full bg-[#ffeaa7]" />
                <span className="absolute left-1/2 top-10 h-24 w-40 -translate-x-1/2 rounded-full bg-[#ffeaa7]/35 blur-2xl" />
              </div>
              <div className="absolute left-8 top-9 z-10 text-[#f6b22d]" aria-hidden="true">
                <svg className="h-16 w-24" viewBox="0 0 120 80" fill="none">
                  <path d="M7 58c26-6 32-30 54-24" stroke="currentColor" strokeWidth="3" strokeDasharray="7 7" strokeLinecap="round" />
                  <path d="M70 14l36-12-13 34-10-16-18 12 12-18-7 0z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-[265px] overflow-hidden">
                <Image
                  src="/auth/little-london-kids.png"
                  alt=""
                  fill
                  className="object-contain object-bottom"
                  sizes="45vw"
                  priority={false}
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fff8ee]/95 to-transparent" aria-hidden="true" />
              </div>
          </div>
        </div>

        <NotificationArea items={notifications} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Daily dashboard highlights">
        {heroPulse.map((item) => {
          const Icon = item.icon;
          const tone = kpiToneClasses[item.tone];

          return (
            <article
              className={cn("relative overflow-hidden rounded-[1.35rem] border border-[#eadfce] p-6 shadow-[0_20px_50px_rgba(15,45,71,0.07)]", tone.card)}
              key={item.label}
            >
              <div className={cn("absolute -right-8 -top-8 h-28 w-28 rounded-full", tone.blob)} aria-hidden="true" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className={cn("text-sm font-bold uppercase tracking-[0.12em]", kpiLabelClasses[item.tone])}>{item.label}</p>
                  <p className="mt-4 text-4xl font-semibold tracking-tight">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#5b6f82]">{item.helper}</p>
                </div>
                <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", tone.icon)}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardCard>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8cc9a8] text-white">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-[#0f2d47]">Revenue Overview</h2>
            </div>
            <button className="rounded-xl border border-[#eadfce] bg-white px-4 py-2 text-sm font-medium text-[#0f2d47]" type="button">
              This Month
            </button>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-end">
            <div>
              <p className="text-4xl font-semibold tracking-tight text-[#0f2d47]">142,000 MAD</p>
              <p className="mt-4 text-sm font-semibold text-[#27a86b]">+ 12.5% <span className="font-medium text-[#5b6f82]">vs last month</span></p>
            </div>
            <div className="relative h-40 overflow-hidden rounded-2xl bg-gradient-to-b from-white to-[#eaf5ee]/60 p-3">
              <div className="absolute left-4 top-5 space-y-8 text-xs text-[#9aa8b4]" aria-hidden="true">
                <p>160k</p>
                <p>120k</p>
                <p>80k</p>
              </div>
              <svg className="h-full w-full pl-14" viewBox="0 0 320 150" preserveAspectRatio="none" role="img" aria-label="Revenue overview chart">
                <path d="M0 120 C45 105 70 96 105 70 C135 45 150 60 175 80 C210 105 225 82 250 68 C280 48 290 72 320 58 L320 150 L0 150 Z" fill="#8cc9a8" opacity="0.14" />
                <path d="M0 120 C45 105 70 96 105 70 C135 45 150 60 175 80 C210 105 225 82 250 68 C280 48 290 72 320 58" fill="none" stroke="#71bd8e" strokeWidth="4" strokeLinecap="round" />
                {[0, 58, 105, 175, 250, 320].map((x, index) => (
                  <circle key={x} cx={x} cy={[120, 96, 70, 80, 68, 58][index]} r="5" fill="#71bd8e" stroke="white" strokeWidth="3" />
                ))}
              </svg>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d6b36a] text-white">
                <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-[#0f2d47]">Attendance Overview</h2>
            </div>
            <button className="rounded-xl border border-[#eadfce] bg-white px-4 py-2 text-sm font-medium text-[#0f2d47]" type="button">
              This Week
            </button>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-[190px_1fr] sm:items-center">
            <div className="relative mx-auto h-40 w-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label="Attendance overview donut chart">
                <circle cx="60" cy="60" r="44" fill="none" stroke="#f1ebe1" strokeWidth="16" />
                <circle cx="60" cy="60" r="44" fill="none" stroke="#71bd8e" strokeWidth="16" strokeDasharray="260 276" strokeLinecap="round" />
                <circle cx="60" cy="60" r="44" fill="none" stroke="#f57261" strokeWidth="16" strokeDasharray="14 276" strokeDashoffset="-260" strokeLinecap="round" />
                <circle cx="60" cy="60" r="44" fill="none" stroke="#f6c85f" strokeWidth="16" strokeDasharray="8 276" strokeDashoffset="-274" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-[#0f2d47]">94%</div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Present", value: "94% (286)", dot: "bg-[#71bd8e]" },
                { label: "Absent", value: "4% (12)", dot: "bg-[#f57261]" },
                { label: "Late", value: "2% (6)", dot: "bg-[#f6c85f]" },
              ].map((item) => (
                <div className="flex items-center justify-between gap-3 text-sm" key={item.label}>
                  <span className="flex items-center gap-2 text-[#0f2d47]">
                    <span className={cn("h-3 w-3 rounded-full", item.dot)} />
                    {item.label}
                  </span>
                  <span className="font-semibold text-[#0f2d47]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-3" aria-label="Analytics widgets">
        {analyticsWidgets.map((widget) => {
          const Icon = widget.icon;

          return (
            <DashboardCard key={widget.label}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#68a783]">{widget.label}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f2d47]">{widget.value}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5b6f82]">{widget.helper}</p>
                </div>
                <span className="rounded-2xl bg-[#fff8ee] p-3 text-[#0f2d47] shadow-inner-soft">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <svg className="mt-6 h-28 w-full" viewBox="0 0 180 82" preserveAspectRatio="none" role="img" aria-label={`${widget.label} chart`}>
                <polygon className={widget.fill} points={trendFillPoints(widget.points)} />
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f24a3a]">Upcoming events</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0f2d47]">Workshops and special bookings</h2>
          <div className="mt-5 space-y-3">
            {upcomingEvents.map((event) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#dde5ec]/80 bg-[#fff8ee] p-4 text-sm" key={event.title}>
                <div>
                  <p className="font-semibold text-[#0f2d47]">{event.title}</p>
                  <p className="mt-1 text-xs text-[#5b6f82]">{event.meta}</p>
                </div>
                <span className="rounded-full bg-[#8cc9a8]/20 px-3 py-1 text-xs font-semibold text-[#0f2d47]">{event.capacity}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d6b36a]">Outstanding invoices</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0f2d47]">Finance follow-up</h2>
          <div className="mt-5 space-y-3">
            {outstandingInvoices.map((invoice) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#dde5ec]/80 bg-[#fff8ee] p-4 text-sm" key={invoice.family}>
                <div>
                  <p className="font-semibold text-[#0f2d47]">{invoice.family}</p>
                  <p className="mt-1 text-xs text-[#5b6f82]">{invoice.status}</p>
                </div>
                <span className="text-sm font-semibold text-[#0f2d47]">{invoice.amount}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {experience.panels.map((panel) => (
          <DashboardCard key={panel.title}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#68a783]">{panel.eyebrow}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0f2d47]">{panel.title}</h2>
            <div className="mt-5 space-y-3">
              {panel.items.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#dde5ec]/80 bg-[#fff8ee] p-4 text-sm text-[#30495f]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f24a3a]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        ))}
      </section>

      <DashboardCard>
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f24a3a]">Quick actions</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0f2d47]">Frequent operations</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b6f82]">Presentation-only action cards for the core operations team.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Button
                  className="h-auto justify-start rounded-2xl border-[#dde5ec] bg-white/80 p-4 text-left text-[#0f2d47] shadow-inner-soft hover:bg-[#fff8ee]"
                  key={action.label}
                  type="button"
                  variant="outline"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f24a3a]/10 text-[#f24a3a]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{action.label}</span>
                    <span className="mt-1 block whitespace-normal text-xs font-medium text-[#5b6f82]">{action.helper}</span>
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
