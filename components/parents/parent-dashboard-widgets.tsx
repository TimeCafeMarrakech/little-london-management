import { Archive, MailCheck, UserRound, UsersRound } from "lucide-react";

import type { ParentDashboardMetrics } from "@/features/parents/types";

type ParentDashboardWidgetsProps = {
  metrics: ParentDashboardMetrics;
};

const cards = [
  { key: "totalParents", label: "Total parents", helper: "Normalized profiles", icon: UsersRound },
  { key: "activeParents", label: "Active parents", helper: "Available for operations", icon: UserRound },
  { key: "invitedParents", label: "Invited portals", helper: "Awaiting activation", icon: MailCheck },
  { key: "archivedParents", label: "Archived", helper: "Hidden from daily lists", icon: Archive },
] as const;

export function ParentDashboardWidgets({ metrics }: ParentDashboardWidgetsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Parent dashboard widgets">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="ll-card-premium p-5" key={card.key}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics[card.key]}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/25 text-primary shadow-inner-soft">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{card.helper}</p>
          </article>
        );
      })}
    </section>
  );
}
