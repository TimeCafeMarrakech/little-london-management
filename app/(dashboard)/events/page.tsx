import Link from "next/link";

import { EventCard } from "@/components/events/event-card";
import { EventDashboardWidgets } from "@/components/events/event-dashboard-widgets";
import { EventEmptyState } from "@/components/events/event-empty-state";
import { EventErrorState } from "@/components/events/event-error-state";
import { EventFilters } from "@/components/events/event-filters";
import { Button } from "@/components/ui/button";
import { eventListQuerySchema } from "@/features/events/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageEvents, canReadEvents, listEvents } from "@/services/events/event-service";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const profile = await requireUserProfile();

  if (!canReadEvents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to events management.</p>
      </section>
    );
  }

  const params = await searchParams;
  const filters = eventListQuerySchema.parse({
    query: getFirstParam(params.query),
    category: getFirstParam(params.category),
    status: getFirstParam(params.status),
    dateFrom: getFirstParam(params.dateFrom),
    dateTo: getFirstParam(params.dateTo),
    page: getFirstParam(params.page),
    pageSize: getFirstParam(params.pageSize),
    sort: getFirstParam(params.sort),
    direction: getFirstParam(params.direction),
  });
  const canManage = canManageEvents(profile);

  try {
    const result = await listEvents(profile, filters);

    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">Events & workshops</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Events</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Manage workshops, holiday camps, birthday events, and boutique Little London activities.
              </p>
            </div>
            {canManage ? <Button asChild><Link href="/events/new">Create event</Link></Button> : null}
          </div>
        </section>
        <EventDashboardWidgets metrics={result.metrics} />
        <EventFilters filters={filters} />
        {result.events.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.events.map((event) => <EventCard event={event} key={event.id} />)}
          </div>
        ) : (
          <EventEmptyState actionHref={canManage ? "/events/new" : undefined} actionLabel="Create event" description="Events matching the current filters will appear here." title="No events found" />
        )}
      </div>
    );
  } catch {
    return <EventErrorState message="The Phase 10 Supabase migration may not be applied yet. Apply the events migration, then reload this page." />;
  }
}
