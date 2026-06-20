import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

type AcademicEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AcademicEmptyState({ title, description, actionHref, actionLabel }: AcademicEmptyStateProps) {
  return (
    <section className="rounded-lg border bg-card p-8 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-secondary/25">
        <BookOpen className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </section>
  );
}
