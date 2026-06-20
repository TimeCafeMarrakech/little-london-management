import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

type StudentEmptyStateProps = {
  canCreate: boolean;
  teacherMode?: boolean;
};

export function StudentEmptyState({ canCreate, teacherMode = false }: StudentEmptyStateProps) {
  return (
    <section className="rounded-lg border bg-card p-10 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-secondary/25 text-primary">
        <GraduationCap className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold">{teacherMode ? "Assigned students will appear here" : "No students found"}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {teacherMode
          ? "Teacher assignment visibility is prepared for Phase 7 class assignments. No unrelated students are shown."
          : "Try changing the filters or register the first student profile for Little London."}
      </p>
      {canCreate ? (
        <Button asChild className="mt-6">
          <Link href="/students/new">Create student</Link>
        </Button>
      ) : null}
    </section>
  );
}
