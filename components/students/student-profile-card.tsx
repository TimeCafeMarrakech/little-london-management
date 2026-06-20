import Link from "next/link";
import { AlertCircle, Phone, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StudentListItem } from "@/features/students/types";
import { cn } from "@/lib/utils";

type StudentProfileCardProps = {
  student: StudentListItem;
};

const statusStyles: Record<StudentListItem["status"], string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-300",
  inactive: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  archived: "bg-muted text-muted-foreground",
};

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {student.firstName.charAt(0)}
          {student.lastName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{student.fullName}</h2>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", statusStyles[student.status])}>
              {student.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.studentNumber} · {student.age} years old
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-md bg-muted/45 p-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Parents
          </dt>
          <dd className="mt-1 font-semibold">{student.parentCount}</dd>
        </div>
        <div className="rounded-md bg-muted/45 p-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Emergency
          </dt>
          <dd className="mt-1 font-semibold">{student.emergencyContactCount}</dd>
        </div>
        <div className="rounded-md bg-muted/45 p-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Allergies
          </dt>
          <dd className="mt-1 font-semibold">{student.allergyCount}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{student.schoolName ?? "No external school recorded"}</p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/students/${student.id}`}>View profile</Link>
        </Button>
      </div>
    </article>
  );
}
