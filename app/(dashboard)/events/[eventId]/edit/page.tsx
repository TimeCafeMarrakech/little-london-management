import { notFound } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageEvents, getEventDetail, listEventTypes } from "@/services/events/event-service";

export const dynamic = "force-dynamic";

type EditEventPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const profile = await requireUserProfile();

  if (!canManageEvents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to edit events.</p>
      </section>
    );
  }

  const { eventId } = await params;
  const [event, eventTypes] = await Promise.all([getEventDetail(profile, eventId), listEventTypes(profile)]);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Events & workshops</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Edit event</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Update schedule, capacity, price, status, and event details.
        </p>
      </section>
      <EventForm event={event} eventTypes={eventTypes} />
    </div>
  );
}
