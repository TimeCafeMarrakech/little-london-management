import Link from "next/link";
import { CalendarDays, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TeacherListItem } from "@/features/teachers/types";

type TeacherProfileCardProps = {
  teacher: TeacherListItem;
};

const statusStyles: Record<TeacherListItem["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  archived: "bg-destructive/10 text-destructive",
};

function formatEmploymentType(value: TeacherListItem["employmentType"]): string {
  return value.replaceAll("_", " ");
}

export function TeacherProfileCard({ teacher }: TeacherProfileCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            {teacher.firstName.charAt(0)}
            {teacher.lastName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{teacher.fullName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{teacher.teacherNumber}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[teacher.status]}`}>{teacher.status}</span>
      </div>

      <div className="mt-5 space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4" aria-hidden="true" />
          {teacher.email ?? "No email recorded"}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4" aria-hidden="true" />
          {teacher.phone ?? "No phone recorded"}
        </p>
        <p className="flex items-center gap-2 capitalize">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatEmploymentType(teacher.employmentType)}
        </p>
      </div>

      <div className="mt-5 rounded-md bg-muted/45 p-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{teacher.availabilityNotes ?? "Availability notes can be added from the teacher profile."}</p>
      </div>

      <Button asChild className="mt-5 w-full" variant="outline">
        <Link href={`/teachers/${teacher.id}`}>View profile</Link>
      </Button>
    </article>
  );
}
