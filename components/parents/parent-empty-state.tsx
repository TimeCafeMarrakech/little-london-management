import Link from "next/link";
import { UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";

type ParentEmptyStateProps = {
  canCreate: boolean;
  placeholderMode?: boolean;
};

export function ParentEmptyState({ canCreate, placeholderMode = false }: ParentEmptyStateProps) {
  return (
    <section className="rounded-lg border bg-card p-10 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-secondary/25 text-primary">
        <UsersRound className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">{placeholderMode ? "Parent visibility will appear here" : "No parents found"}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {placeholderMode
          ? "Teacher and parent-specific views are prepared as placeholders until assignment and portal workflows exist."
          : "Try changing the filters or create the first normalized parent profile."}
      </p>
      {canCreate ? (
        <Button asChild className="mt-6">
          <Link href="/parents/new">Create parent</Link>
        </Button>
      ) : null}
    </section>
  );
}
