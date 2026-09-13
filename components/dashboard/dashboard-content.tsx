import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, FilePlus2, GraduationCap, ReceiptText, UserPlus, UsersRound, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/auth/types";
import type { ManagementDashboardData } from "@/services/dashboard/dashboard-service";

type Props = { profile: UserProfile; data: ManagementDashboardData };

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value)} MAD`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

const quickActions = [
  { label: "Add student", helper: "Create a child profile", icon: UserPlus, href: "/students/new" },
  { label: "Create invoice", helper: "Start a new invoice", icon: FilePlus2, href: "/invoices/new" },
  { label: "Mark attendance", helper: "Open today's attendance", icon: ClipboardCheck, href: "/attendance" },
  { label: "Create event", helper: "Plan an activity", icon: CalendarDays, href: "/events/new" },
];

export function DashboardContent({ profile, data }: Props) {
  const firstName = profile.fullName.trim().split(/\s+/)[0] || "there";
  const recorded = data.attendance.presentCount + data.attendance.absentCount + data.attendance.lateCount;
  const attendanceRate = recorded > 0 ? Math.round((data.attendance.presentCount / recorded) * 100) : 0;
  const highlights = [
    ...(data.finance ? [
      { label: "Total revenue", value: formatMoney(data.finance.totalRevenue), helper: "All recorded payments", icon: WalletCards, href: "/payments", tone: "bg-[#f24a3a]/10 text-[#f24a3a]" },
      { label: "Pending money", value: formatMoney(data.outstandingBalance), helper: `${data.finance.outstandingInvoices} open invoices`, icon: ReceiptText, href: "/invoices", tone: "bg-[#f6c85f]/25 text-[#9a6a00]" },
    ] : []),
    { label: "Total students", value: String(data.students.totalStudents), helper: `${data.students.activeStudents} active`, icon: UsersRound, href: "/students", tone: "bg-[#8cc9a8]/25 text-[#39785a]" },
    { label: "Active classes", value: String(data.academic.activeClasses), helper: `${data.academic.activeEnrolments} active enrolments`, icon: GraduationCap, href: "/classes", tone: "bg-[#8bb8df]/20 text-[#376c98]" },
  ];

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[1.6rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_25px_70px_rgba(15,45,71,0.09)] lg:p-8">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#8cc9a8]/25" aria-hidden="true" />
      <div className="relative">
        <p className="text-sm font-semibold text-[#f24a3a]">Welcome back, {firstName}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0f2d47] sm:text-4xl">Little London overview</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5b6f82] sm:text-base">Live operational and financial information from your current records.</p>
        <span className="mt-5 inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#39785a]">Live data</span>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Business highlights">
      {highlights.map((item) => { const Icon = item.icon; return <Link className="group rounded-[1.35rem] border border-[#eadfce] bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,45,71,0.07)] transition hover:-translate-y-0.5 hover:shadow-lg" href={item.href} key={item.label}>
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5b6f82]">{item.label}</p><p className="mt-3 text-2xl font-semibold tracking-tight text-[#0f2d47] sm:text-3xl">{item.value}</p><p className="mt-2 text-sm text-[#5b6f82]">{item.helper}</p></div><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}><Icon className="h-5 w-5" /></span></div>
      </Link>; })}
    </section>

    <section className="grid gap-5 lg:grid-cols-3">
      <DashboardCard><p className="eyebrow">Today</p><h2 className="mt-2 text-xl font-semibold">Attendance</h2><p className="mt-5 text-4xl font-semibold">{attendanceRate}%</p><p className="mt-2 text-sm text-[#5b6f82]">{recorded ? `${data.attendance.presentCount} present from ${recorded} recorded` : "No attendance recorded today"}</p><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs"><span className="rounded-xl bg-[#8cc9a8]/20 p-2"><b className="block text-base">{data.attendance.presentCount}</b>Present</span><span className="rounded-xl bg-[#f24a3a]/10 p-2"><b className="block text-base">{data.attendance.absentCount}</b>Absent</span><span className="rounded-xl bg-[#f6c85f]/20 p-2"><b className="block text-base">{data.attendance.lateCount}</b>Late</span></div><MoreLink href="/attendance">Open attendance</MoreLink></DashboardCard>
      <DashboardCard><p className="eyebrow">This month</p><h2 className="mt-2 text-xl font-semibold">Money received</h2><p className="mt-5 text-4xl font-semibold">{data.finance ? formatMoney(data.finance.paymentsThisMonth) : "Restricted"}</p><p className="mt-2 text-sm text-[#5b6f82]">Payments recorded since the start of this month</p>{data.finance ? <p className="mt-4 text-sm font-medium text-[#9a6a00]">{data.finance.overdueInvoices} overdue invoices</p> : null}<MoreLink href="/payments">View payments</MoreLink></DashboardCard>
      <DashboardCard><p className="eyebrow">Operations</p><h2 className="mt-2 text-xl font-semibold">What needs attention</h2><div className="mt-5 space-y-3 text-sm text-[#30495f]"><Attention value={data.attendance.pendingSessions}>draft attendance sessions today</Attention><Attention value={data.academic.classesNearCapacity}>classes near capacity</Attention><Attention value={data.events.eventsNearCapacity}>events near capacity</Attention><Attention value={data.students.medicalAlerts}>active allergy alerts</Attention></div></DashboardCard>
    </section>

    <section className="grid gap-5 lg:grid-cols-2">
      <DashboardCard><SectionTitle eyebrow="Finance" title="Invoices requiring payment" href="/invoices" /><div className="mt-5 space-y-3">{data.outstandingInvoices.length === 0 ? <Empty>No outstanding invoices.</Empty> : data.outstandingInvoices.map((invoice) => <Link className="flex items-center justify-between gap-4 rounded-xl border border-[#eadfce] p-4 hover:bg-[#fff8ee]" href={`/invoices/${invoice.id}`} key={invoice.id}><div><p className="font-semibold">{invoice.family}</p><p className="mt-1 text-xs text-[#5b6f82]">{invoice.invoiceNumber} · Due {formatDate(invoice.dueDate)}{invoice.overdue ? " · Overdue" : ""}</p></div><span className="shrink-0 font-semibold">{formatMoney(invoice.balanceDue)}</span></Link>)}</div></DashboardCard>
      <DashboardCard><SectionTitle eyebrow="Calendar" title="Upcoming events" href="/events" /><div className="mt-5 space-y-3">{data.upcomingEvents.length === 0 ? <Empty>No upcoming active events.</Empty> : data.upcomingEvents.map((event) => <Link className="flex items-center justify-between gap-4 rounded-xl border border-[#eadfce] p-4 hover:bg-[#fff8ee]" href={`/events/${event.id}`} key={event.id}><div><p className="font-semibold">{event.title}</p><p className="mt-1 text-xs text-[#5b6f82]">{formatDate(event.startDate)}{event.startTime ? ` · ${event.startTime.slice(0, 5)}` : ""}</p></div><span className="shrink-0 rounded-full bg-[#8cc9a8]/20 px-3 py-1 text-xs font-semibold">{event.bookings}/{event.capacity}</span></Link>)}</div></DashboardCard>
    </section>

    <DashboardCard><p className="eyebrow">Quick actions</p><h2 className="mt-2 text-xl font-semibold">Frequent operations</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{quickActions.map((action) => { const Icon = action.icon; return <Button asChild className="h-auto justify-start rounded-2xl p-4 text-left" key={action.label} variant="outline"><Link href={action.href}><Icon className="mr-3 h-5 w-5 text-[#f24a3a]" /><span><b className="block">{action.label}</b><small className="font-normal text-[#5b6f82]">{action.helper}</small></span></Link></Button>; })}</div></DashboardCard>
  </div>;
}

function MoreLink({ href, children }: { href: string; children: React.ReactNode }) { return <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#f24a3a]" href={href}>{children}<ArrowRight className="h-4 w-4" /></Link>; }
function Attention({ value, children }: { value: number; children: React.ReactNode }) { return <p className="rounded-xl bg-[#fff8ee] p-3"><b>{value}</b> {children}</p>; }
function Empty({ children }: { children: React.ReactNode }) { return <p className="rounded-xl bg-[#fff8ee] p-4 text-sm text-[#5b6f82]">{children}</p>; }
function SectionTitle({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) { return <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold">{title}</h2></div><Link className="text-sm font-semibold text-[#f24a3a]" href={href}>View all</Link></div>; }
