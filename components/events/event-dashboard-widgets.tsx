import { CalendarDays, Cake, TentTree, TicketCheck, UsersRound, WandSparkles } from "lucide-react";

import type { EventDashboardMetrics } from "@/features/events/types";

type EventDashboardWidgetsProps = {
  metrics: EventDashboardMetrics;
};

const cards = [
  { key: "upcomingEvents", label: "Upcoming events", icon: CalendarDays },
  { key: "activeWorkshops", label: "Active workshops", icon: WandSparkles },
  { key: "holidayCamps", label: "Holiday camps", icon: TentTree },
  { key: "birthdayEvents", label: "Birthday events", icon: Cake },
  { key: "eventsNearCapacity", label: "Near capacity", icon: UsersRound },
  { key: "totalBookings", label: "Total bookings", icon: TicketCheck },
] as const;

export function EventDashboardWidgets({ metrics }: EventDashboardWidgetsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <section className="rounded-lg border bg-card p-5 shadow-soft" key={card.key}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{metrics[card.key]}</p>
              </div>
              <span className="rounded-full bg-secondary/25 p-3">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
            </div>
          </section>
        );
      })}
    </div>
  );
}
