import { BarChart3, CalendarCheck, CreditCard, GraduationCap, LineChart, PieChart, Sparkles, UsersRound } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import type { CategoryBreakdown, ReportsDashboardData, TrendPoint } from "@/features/reports/types";

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}

function maxValue(items: Array<{ value: number }>): number {
  return Math.max(...items.map((item) => item.value), 1);
}

export function ReportsHero({ generatedAt }: { generatedAt: string }) {
  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-[#eadfce] bg-[#fff8ee] p-6 text-[#0f2d47] shadow-[0_25px_70px_rgba(15,45,71,0.09)] lg:p-8">
      <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[#f24a3a]/10" aria-hidden="true" />
      <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-[#8cc9a8]/25" aria-hidden="true" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#f24a3a] shadow-inner-soft">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Reports & analytics
        </span>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">Little London Insights Centre</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b6f82]">
          Read-only management reports for attendance, finance, enrolments, events, and parent/student operations.
        </p>
        <p className="mt-5 text-xs font-medium text-[#5b6f82]">
          Last refreshed {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(generatedAt))}
        </p>
      </div>
    </section>
  );
}

export function ReportMetricGrid({ data }: { data: ReportsDashboardData }) {
  const toneClass = {
    navy: "bg-[#f24a3a] text-white",
    sage: "bg-secondary/35 text-primary",
    gold: "bg-[#d6b36a]/25 text-primary",
    neutral: "bg-muted text-primary",
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.dashboardMetrics.map((metric) => (
        <article className="ll-card-premium p-5" key={metric.label}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{metric.value}</p>
            </div>
            <span className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${toneClass[metric.tone]}`}>{metric.tone}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{metric.helper}</p>
        </article>
      ))}
    </section>
  );
}

export function DashboardAnalytics({ data }: { data: ReportsDashboardData }) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <TrendPanel title="Attendance trend" eyebrow="Learning rhythm" items={data.attendance.trend} suffix=" records" />
      <TrendPanel title="Revenue trend" eyebrow="Finance" items={data.finance.monthlyRevenue} money />
      <TrendPanel title="Enrolment trend" eyebrow="Growth" items={data.enrolments.monthlyTrend} suffix=" enrolments" />
      <BreakdownPanel title="Event bookings" eyebrow="Activities" items={data.events.byCategory} />
      <BreakdownPanel title="Payment methods" eyebrow="Finance" items={data.finance.paymentMethods} money />
      <BreakdownPanel title="Invoice status" eyebrow="Outstanding work" items={data.finance.invoiceStatus} />
    </section>
  );
}

export function ManagementReports({ data }: { data: ReportsDashboardData }) {
  const metrics = [
    ["Active students", data.management.activeStudentCount],
    ["Active parents", data.management.activeParentCount],
    ["Active teachers", data.management.activeTeacherCount],
    ["Active courses", data.management.activeCourseCount],
    ["Active classes", data.management.activeClassCount],
    ["Active events", data.management.activeEventCount],
  ];

  return (
    <DashboardCard>
      <SectionHeading eyebrow="Management reports" title="School overview" icon={BarChart3} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div className="ll-list-row" key={label}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{formatNumber(Number(value))}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function AttendanceReports({ data }: { data: ReportsDashboardData }) {
  return (
    <DashboardCard>
      <SectionHeading eyebrow="Attendance reports" title="Attendance health" icon={CalendarCheck} />
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <MiniMetric label="Sessions" value={data.attendance.totalSessions} />
        <MiniMetric label="Submitted" value={data.attendance.submittedSessions} />
        <MiniMetric label="Attendance rate" value={`${data.attendance.attendanceRate}%`} />
        <MiniMetric label="Completion" value={`${data.attendance.completionRate}%`} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <BreakdownPanel title="Attendance by class" eyebrow="Class view" items={data.attendance.byClass} embedded />
        <BreakdownPanel title="Absence and lateness focus" eyebrow="Student view" items={data.attendance.byStudent} embedded />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        <MiniMetric label="Present" value={data.attendance.presentCount} />
        <MiniMetric label="Absent" value={data.attendance.absentCount} />
        <MiniMetric label="Late" value={data.attendance.lateCount} />
        <MiniMetric label="Excused" value={data.attendance.excusedCount} />
        <MiniMetric label="Sick" value={data.attendance.sickCount} />
      </div>
    </DashboardCard>
  );
}

export function FinanceReports({ data }: { data: ReportsDashboardData }) {
  return (
    <DashboardCard>
      <SectionHeading eyebrow="Finance reports" title="Revenue and balances" icon={CreditCard} />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Total invoiced" value={formatMoney(data.finance.totalInvoiced)} />
        <MiniMetric label="Total paid" value={formatMoney(data.finance.totalPaid)} />
        <MiniMetric label="Outstanding" value={formatMoney(data.finance.outstandingBalance)} />
        <MiniMetric label="Overdue" value={formatMoney(data.finance.overdueBalance)} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <BreakdownPanel title="Payment method reporting" eyebrow="Cash, bank transfer, cheque" items={data.finance.paymentMethods} money embedded />
        <BreakdownPanel title="Invoice status" eyebrow="Billing status" items={data.finance.invoiceStatus} embedded />
      </div>
    </DashboardCard>
  );
}

export function EnrolmentReports({ data }: { data: ReportsDashboardData }) {
  return (
    <DashboardCard>
      <SectionHeading eyebrow="Enrolment reports" title="Courses, classes and capacity" icon={GraduationCap} />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <MiniMetric label="Total enrolments" value={data.enrolments.totalEnrolments} />
        <MiniMetric label="Active enrolments" value={data.enrolments.activeEnrolments} />
        <MiniMetric label="New this month" value={data.enrolments.newThisMonth} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <BreakdownPanel title="By course" eyebrow="Programme demand" items={data.enrolments.byCourse} embedded />
        <BreakdownPanel title="By class" eyebrow="Class demand" items={data.enrolments.byClass} embedded />
        <BreakdownPanel title="Capacity" eyebrow="Fill rate" items={data.enrolments.capacity} percent embedded />
      </div>
    </DashboardCard>
  );
}

export function EventReports({ data }: { data: ReportsDashboardData }) {
  return (
    <DashboardCard>
      <SectionHeading eyebrow="Event reports" title="Workshops, camps and birthdays" icon={PieChart} />
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <MiniMetric label="Total events" value={data.events.totalEvents} />
        <MiniMetric label="Upcoming" value={data.events.upcomingEvents} />
        <MiniMetric label="Bookings" value={data.events.totalBookings} />
        <MiniMetric label="Near capacity" value={data.events.nearCapacity} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <BreakdownPanel title="Bookings by category" eyebrow="Event mix" items={data.events.byCategory} embedded />
        <BreakdownPanel title="Payment status" eyebrow="Event billing" items={data.events.byPaymentStatus} embedded />
        <BreakdownPanel title="Event capacity" eyebrow="Fill rate" items={data.events.capacity} percent embedded />
      </div>
    </DashboardCard>
  );
}

export function ParentStudentReports({ data }: { data: ReportsDashboardData }) {
  return (
    <DashboardCard>
      <SectionHeading eyebrow="Parent / student reports" title="Family and student summary" icon={UsersRound} />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <MiniMetric label="Active students" value={data.parentStudents.activeStudents} />
        <MiniMetric label="Active parents" value={data.parentStudents.activeParents} />
        <MiniMetric label="Students with events" value={data.parentStudents.studentsWithEventBookings} />
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
        <div className="grid grid-cols-5 gap-3 bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span>Student</span>
          <span>Enrolments</span>
          <span>Attendance</span>
          <span>Invoices</span>
          <span>Events</span>
        </div>
        {data.parentStudents.roster.length > 0 ? data.parentStudents.roster.map((student) => (
          <div className="grid grid-cols-5 gap-3 border-t border-border/70 px-4 py-3 text-sm" key={student.studentNumber}>
            <span className="font-medium">{student.studentName}</span>
            <span>{student.activeEnrolments}</span>
            <span>{student.attendanceRecords}</span>
            <span>{student.invoiceCount}</span>
            <span>{student.eventBookings}</span>
          </div>
        )) : (
          <p className="px-4 py-5 text-sm text-muted-foreground">No student report rows available yet.</p>
        )}
      </div>
    </DashboardCard>
  );
}

export function ExportStrategyPanel() {
  return (
    <DashboardCard>
      <SectionHeading eyebrow="Export strategy" title="Read-only report exports" icon={LineChart} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="ll-list-row">
          <p className="font-semibold">CSV exports</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Planned for simple tabular management reports with the same filters and permissions as on-screen data.</p>
        </div>
        <div className="ll-list-row">
          <p className="font-semibold">PDF summaries</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Planned for polished management summaries. Accounting exports and Parent Portal reports remain excluded.</p>
        </div>
      </div>
    </DashboardCard>
  );
}

function SectionHeading({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: typeof BarChart3 }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-lg bg-accent/15 p-3 text-primary shadow-inner-soft">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="ll-section-label">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="ll-list-row">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{typeof value === "number" ? formatNumber(value) : value}</p>
    </div>
  );
}

function TrendPanel({ title, eyebrow, items, money = false, suffix = "" }: { title: string; eyebrow: string; items: TrendPoint[]; money?: boolean; suffix?: string }) {
  return (
    <DashboardCard>
      <p className="ll-section-label">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 flex h-40 items-end gap-3">
        {items.length > 0 ? items.map((item) => {
          const height = Math.max((item.value / maxValue(items)) * 100, 8);

          return (
            <div className="flex flex-1 flex-col items-center gap-2" key={item.label}>
              <div className="w-full rounded-t-lg bg-[#8cc9a8] shadow-inner-soft" style={{ height: `${height}%` }} />
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            </div>
          );
        }) : <p className="self-center text-sm text-muted-foreground">No trend data yet.</p>}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {items.length > 0 ? `${money ? formatMoney(items.at(-1)?.value ?? 0) : `${formatNumber(items.at(-1)?.value ?? 0)}${suffix}`} latest period` : "Awaiting data"}
      </p>
    </DashboardCard>
  );
}

function BreakdownPanel({
  title,
  eyebrow,
  items,
  money = false,
  percent = false,
  embedded = false,
}: {
  title: string;
  eyebrow: string;
  items: CategoryBreakdown[];
  money?: boolean;
  percent?: boolean;
  embedded?: boolean;
}) {
  const content = (
    <>
      <p className="ll-section-label">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length > 0 ? items.map((item) => {
          const width = Math.max((item.value / maxValue(items)) * 100, 4);
          const value = money ? formatMoney(item.value) : percent ? `${Math.round(item.value)}%` : formatNumber(item.value);

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
              </div>
              {item.helper ? <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p> : null}
            </div>
          );
        }) : <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">No report data yet.</p>}
      </div>
    </>
  );

  return embedded ? <section className="rounded-xl border border-border/70 bg-background/45 p-5">{content}</section> : <DashboardCard>{content}</DashboardCard>;
}
