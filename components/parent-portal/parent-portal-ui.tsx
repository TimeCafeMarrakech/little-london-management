import { CalendarDays, CheckCircle2, CreditCard, Heart, ReceiptText, UsersRound, WalletCards } from "lucide-react";
import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type {
  ParentPortalAttendanceRecord,
  ParentPortalChild,
  ParentPortalClass,
  ParentPortalDashboard,
  ParentPortalEventBooking,
  ParentPortalFinance,
  ParentPortalInvoice,
  ParentPortalPayment,
} from "@/features/parent-portal/types";

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function ParentPortalHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/10 bg-primary p-6 text-primary-foreground shadow-premium lg:p-8">
      <p className="text-sm font-medium text-accent">Little London Parent Portal</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/75">{subtitle}</p>
    </section>
  );
}

export function ParentDashboardOverview({ data }: { data: ParentPortalDashboard }) {
  const cards = [
    { label: "My children", value: data.children.length.toString(), helper: "Linked child profiles", icon: Heart },
    { label: "Next class", value: data.nextClass?.className ?? "No class", helper: data.nextClass?.courseName ?? "Nothing upcoming yet", icon: CalendarDays },
    { label: "Attendance", value: `${data.attendanceRate}%`, helper: "Submitted attendance history", icon: CheckCircle2 },
    { label: "Outstanding", value: formatMoney(data.outstandingBalance), helper: "Current family balance", icon: WalletCards },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="ll-card-premium p-5" key={card.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-primary shadow-inner-soft">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.helper}</p>
          </article>
        );
      })}
    </section>
  );
}

export function ParentDashboardPanels({ data }: { data: ParentPortalDashboard }) {
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <DashboardCard>
        <p className="ll-section-label">Recent invoices</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Finance snapshot</h2>
        <div className="mt-5 space-y-3">
          {data.recentInvoices.length > 0 ? data.recentInvoices.map((invoice) => <InvoiceRow invoice={invoice} key={invoice.id} />) : <EmptyText text="No invoices to show." />}
        </div>
      </DashboardCard>

      <DashboardCard>
        <p className="ll-section-label">Recent payments</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Payment history</h2>
        <div className="mt-5 space-y-3">
          {data.recentPayments.length > 0 ? data.recentPayments.map((payment) => <PaymentRow key={payment.id} payment={payment} />) : <EmptyText text="No payments recorded yet." />}
        </div>
      </DashboardCard>

      <DashboardCard>
        <p className="ll-section-label">Upcoming events</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Booked activities</h2>
        <div className="mt-5 space-y-3">
          {data.upcomingEvents.length > 0 ? data.upcomingEvents.map((event) => <EventRow event={event} key={event.id} />) : <EmptyText text="No upcoming event bookings yet." />}
        </div>
      </DashboardCard>
    </section>
  );
}

export function ChildrenGrid({ items }: { items: ParentPortalChild[] }) {
  if (items.length === 0) {
    return <EmptyState title="No linked children yet" description="Your child profiles will appear here once Little London links them to your parent account." />;
  }

  return (
    <section className="grid gap-5 md:grid-cols-2">
      {items.map((child) => (
        <article className="ll-card-premium p-6" key={child.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="ll-section-label">{formatStatus(child.relationshipType)}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{child.fullName}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Student {child.studentNumber}</p>
            </div>
            <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold capitalize text-primary">{child.status}</span>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Date of birth: <span className="font-medium text-foreground">{formatDate(child.dateOfBirth)}</span></p>
            <p>Active enrolments: <span className="font-medium text-foreground">{child.activeEnrolmentCount}</span></p>
            <p>Language: <span className="font-medium text-foreground">{child.primaryLanguage ?? "Not set"}</span></p>
            <p>School: <span className="font-medium text-foreground">{child.schoolName ?? "Not set"}</span></p>
          </div>
          <Button asChild className="mt-5" variant="outline">
            <Link href={`/portal/children/${child.id}`}>View child summary</Link>
          </Button>
        </article>
      ))}
    </section>
  );
}

export function ClassesList({ classes }: { classes: ParentPortalClass[] }) {
  if (classes.length === 0) {
    return <EmptyState title="No enrolments visible" description="Your child classes and enrolments will appear here once active." />;
  }

  return (
    <section className="grid gap-4">
      {classes.map((classItem) => <ClassCard classItem={classItem} key={classItem.enrolmentId} />)}
    </section>
  );
}

export function ClassCard({ classItem }: { classItem: ParentPortalClass }) {
  return (
    <article className="ll-card-premium p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="ll-section-label">{classItem.courseName}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{classItem.className}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{classItem.studentName} - {classItem.classCode}</p>
        </div>
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold capitalize text-primary">{formatStatus(classItem.enrolmentStatus)}</span>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
        <p>Enrolled: <span className="font-medium text-foreground">{formatDate(classItem.enrolmentDate)}</span></p>
        <p>Starts: <span className="font-medium text-foreground">{formatDate(classItem.startDate)}</span></p>
        <p>Ends: <span className="font-medium text-foreground">{formatDate(classItem.endDate)}</span></p>
      </div>
      <p className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Teachers: <span className="font-medium text-foreground">{classItem.teachers.length > 0 ? classItem.teachers.join(", ") : "To be confirmed"}</span>
      </p>
    </article>
  );
}

export function AttendanceList({ records }: { records: ParentPortalAttendanceRecord[] }) {
  if (records.length === 0) {
    return <EmptyState title="No attendance history yet" description="Submitted attendance records for your children will appear here." />;
  }

  return (
    <section className="grid gap-3">
      {records.map((record) => (
        <article className="ll-list-row flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between" key={record.id}>
          <div>
            <p className="font-semibold text-foreground">{record.studentName}</p>
            <p className="mt-1 text-muted-foreground">{record.courseName} - {record.className}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary">{formatDate(record.sessionDate)}</span>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold capitalize text-primary">{formatStatus(record.status)}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export function FinanceView({ finance }: { finance: ParentPortalFinance }) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <FinanceMetric label="Outstanding balance" value={formatMoney(finance.outstandingBalance)} icon="balance" />
        <FinanceMetric label="Invoices" value={finance.invoiceCount.toString()} icon="invoice" />
        <FinanceMetric label="Paid total" value={formatMoney(finance.paidTotal)} icon="payment" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardCard>
          <p className="ll-section-label">Invoices</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Family invoices</h2>
          <div className="mt-5 space-y-3">
            {finance.invoices.length > 0 ? finance.invoices.map((invoice) => <InvoiceRow invoice={invoice} key={invoice.id} />) : <EmptyText text="No invoices visible yet." />}
          </div>
        </DashboardCard>

        <DashboardCard>
          <p className="ll-section-label">Payments</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Payment history</h2>
          <div className="mt-5 space-y-3">
            {finance.payments.length > 0 ? finance.payments.map((payment) => <PaymentRow payment={payment} key={payment.id} />) : <EmptyText text="No payments visible yet." />}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}

function FinanceMetric({ label, value, icon }: { label: string; value: string; icon: "balance" | "invoice" | "payment" }) {
  const Icon = icon === "balance" ? WalletCards : icon === "invoice" ? ReceiptText : CreditCard;

  return (
    <article className="ll-card-premium p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-primary shadow-inner-soft">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function InvoiceRow({ invoice }: { invoice: ParentPortalInvoice }) {
  return (
    <div className="ll-list-row text-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">{invoice.invoiceNumber}</p>
          <p className="mt-1 text-muted-foreground">{invoice.studentName} - due {formatDate(invoice.dueDate)}</p>
        </div>
        <span className="text-right font-semibold text-primary">{formatMoney(invoice.balanceDue)}</span>
      </div>
      <p className="mt-2 text-xs capitalize text-muted-foreground">Status: {formatStatus(invoice.status)}</p>
    </div>
  );
}

function PaymentRow({ payment }: { payment: ParentPortalPayment }) {
  return (
    <div className="ll-list-row text-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">{payment.paymentNumber}</p>
          <p className="mt-1 text-muted-foreground">{payment.studentName} - {formatDate(payment.paymentDate)}</p>
        </div>
        <span className="text-right font-semibold text-primary">{formatMoney(payment.amount)}</span>
      </div>
      <p className="mt-2 text-xs capitalize text-muted-foreground">Method: {formatStatus(payment.paymentMethod)}</p>
    </div>
  );
}

export function EventsList({ events, title = "Event bookings" }: { events: ParentPortalEventBooking[]; title?: string }) {
  if (events.length === 0) {
    return <EmptyState title={`No ${title.toLowerCase()} yet`} description="Booked Little London activities for your children will appear here." />;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {events.map((event) => <EventCard event={event} key={event.id} />)}
    </section>
  );
}

function EventCard({ event }: { event: ParentPortalEventBooking }) {
  return (
    <article className="ll-card-premium p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="ll-section-label">{formatStatus(event.category)}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{event.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{event.studentName} - {event.eventTypeName}</p>
        </div>
        <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold capitalize text-primary">{formatStatus(event.bookingStatus)}</span>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <p>Date: <span className="font-medium text-foreground">{formatDate(event.startDate)}</span></p>
        <p>Time: <span className="font-medium text-foreground">{event.startTime?.slice(0, 5) ?? "Not set"}</span></p>
        <p>Location: <span className="font-medium text-foreground">{event.location ?? "Not set"}</span></p>
        <p>Payment: <span className="font-medium capitalize text-foreground">{formatStatus(event.paymentStatus)}</span></p>
      </div>
      {event.invoiceNumber ? <p className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">Linked invoice: <span className="font-medium text-foreground">{event.invoiceNumber}</span></p> : null}
    </article>
  );
}

function EventRow({ event }: { event: ParentPortalEventBooking }) {
  return (
    <div className="ll-list-row text-sm">
      <p className="font-semibold text-foreground">{event.title}</p>
      <p className="mt-1 text-muted-foreground">{event.studentName} - {formatDate(event.startDate)}</p>
    </div>
  );
}

export function ChildProfileSummary({
  child,
  classes,
  attendance,
  finance,
  events,
}: {
  child: ParentPortalChild;
  classes: ParentPortalClass[];
  attendance: ParentPortalAttendanceRecord[];
  finance: ParentPortalFinance;
  events: ParentPortalEventBooking[];
}) {
  const childClasses = classes.filter((classItem) => classItem.studentId === child.id);
  const childAttendance = attendance.filter((record) => record.studentId === child.id);
  const childInvoices = finance.invoices.filter((invoice) => invoice.studentId === child.id);
  const childEvents = events.filter((event) => event.studentId === child.id);

  return (
    <div className="space-y-6">
      <ChildrenGrid items={[child]} />
      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardCard>
          <p className="ll-section-label">Classes & enrolments</p>
          <div className="mt-5 space-y-3">
            {childClasses.length > 0 ? childClasses.slice(0, 3).map((classItem) => <ClassCard classItem={classItem} key={classItem.enrolmentId} />) : <EmptyText text="No classes visible yet." />}
          </div>
        </DashboardCard>
        <DashboardCard>
          <p className="ll-section-label">Attendance</p>
          <div className="mt-5 space-y-3">
            {childAttendance.length > 0 ? <AttendanceList records={childAttendance.slice(0, 5)} /> : <EmptyText text="No attendance history yet." />}
          </div>
        </DashboardCard>
        <DashboardCard>
          <p className="ll-section-label">Finance</p>
          <div className="mt-5 space-y-3">
            {childInvoices.length > 0 ? childInvoices.slice(0, 3).map((invoice) => <InvoiceRow invoice={invoice} key={invoice.id} />) : <EmptyText text="No invoices for this child." />}
          </div>
        </DashboardCard>
        <DashboardCard>
          <p className="ll-section-label">Event bookings</p>
          <div className="mt-5 space-y-3">
            {childEvents.length > 0 ? childEvents.slice(0, 3).map((event) => <EventRow event={event} key={event.id} />) : <EmptyText text="No event bookings for this child." />}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="ll-card-premium p-8 text-center">
      <UsersRound className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
    </section>
  );
}

function EmptyText({ text }: { text: string }) {
  return <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">{text}</p>;
}
