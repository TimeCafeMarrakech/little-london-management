import Link from "next/link";
import { notFound } from "next/navigation";

import { EventManagementPanel } from "@/components/events/event-management-panel";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageEvents, canReadEvents, getEventDetail } from "@/services/events/event-service";

export const dynamic = "force-dynamic";

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const profile = await requireUserProfile();

  if (!canReadEvents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to view this event.</p>
      </section>
    );
  }

  const { eventId } = await params;
  const event = await getEventDetail(profile, eventId);

  if (!event) {
    notFound();
  }

  const canManage = canManageEvents(profile);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{event.eventCode}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{event.title}</h1>
            <p className="mt-2 text-sm capitalize text-muted-foreground">
              {event.category.replace("_", " ")} - {event.eventTypeName}
            </p>
          </div>
          {canManage ? <Button asChild variant="outline"><Link href={`/events/${event.id}/edit`}>Edit event</Link></Button> : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Capacity", `${event.bookingCount}/${event.capacity}`],
          ["Price", formatMoney(event.price)],
          ["Status", event.status],
          ["Staff", event.staffCount.toString()],
        ].map(([label, value]) => (
          <section className="rounded-lg border bg-card p-5 shadow-soft" key={label}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold capitalize">{value}</p>
          </section>
        ))}
      </div>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Event overview</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">Dates: {event.startDate} to {event.endDate}</p>
          <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">Time: {event.startTime?.slice(0, 5) ?? "Not set"} to {event.endTime?.slice(0, 5) ?? "Not set"}</p>
          <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">Location: {event.location ?? "Not set"}</p>
          <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">Notes: {event.notes ?? "No notes recorded."}</p>
        </div>
        <p className="mt-4 rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">{event.description ?? "No description recorded."}</p>
      </section>

      <EventManagementPanel canManage={canManage} event={event} />
    </div>
  );
}
