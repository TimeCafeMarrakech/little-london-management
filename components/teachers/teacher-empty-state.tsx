import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

type TeacherEmptyStateProps = {
  canManage: boolean;
};

export function TeacherEmptyState({ canManage }: TeacherEmptyStateProps) {
  return (
    <section className="rounded-lg border bg-card p-8 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-secondary/25">
        <GraduationCap className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">No teachers found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Teacher profiles will appear here once they match the current search or filter.
      </p>
      {canManage ? (
        <Button asChild className="mt-6">
          <Link href="/teachers/new">Create teacher</Link>
        </Button>
      ) : null}
    </section>
  );
}
