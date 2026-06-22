import { EventForm } from "@/components/events/event-form";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageEvents, listEventTypes } from "@/services/events/event-service";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const profile = await requireUserProfile();

  if (!canManageEvents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have permission to create events.</p>
      </section>
    );
  }

  const eventTypes = await listEventTypes(profile);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Events & workshops</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create event</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Create a workshop, holiday camp, birthday event, or special Little London activity.
        </p>
      </section>
      <EventForm eventTypes={eventTypes} />
    </div>
  );
}
