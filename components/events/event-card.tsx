import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { EventListItem } from "@/features/events/types";

type EventCardProps = {
  event: EventListItem;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export function EventCard({ event }: EventCardProps) {
  const capacityLabel = `${event.bookingCount}/${event.capacity}`;

  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">{event.eventCode}</p>
          <h2 className="mt-2 text-xl font-semibold">{event.title}</h2>
          <p className="mt-1 text-sm capitalize text-muted-foreground">{event.category.replace("_", " ")} - {event.eventTypeName}</p>
        </div>
        <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold capitalize text-primary">
          {event.status}
        </span>
      </div>
      <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
        <p>{event.startDate}{event.endDate !== event.startDate ? ` to ${event.endDate}` : ""}</p>
        <p>{event.location ?? "Location not set"}</p>
        <p>Capacity: <span className="font-semibold text-foreground">{capacityLabel}</span></p>
        <p>Price: <span className="font-semibold text-foreground">{formatMoney(event.price)}</span></p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={`/events/${event.id}`}>View event</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/events/${event.id}/edit`}>Edit</Link>
        </Button>
      </div>
    </article>
  );
}
