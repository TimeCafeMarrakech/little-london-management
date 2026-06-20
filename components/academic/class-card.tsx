import Link from "next/link";
import { CalendarDays, GraduationCap, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ClassListItem } from "@/features/academic/types";

type ClassCardProps = {
  classItem: ClassListItem;
};

const statusStyles: Record<ClassListItem["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  archived: "bg-destructive/10 text-destructive",
};

export function ClassCard({ classItem }: ClassCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent">{classItem.classCode}</p>
          <h2 className="mt-2 truncate text-lg font-semibold">{classItem.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{classItem.courseName}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[classItem.status]}`}>{classItem.status}</span>
      </div>
      <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          {classItem.enrolmentCount} / {classItem.capacity} students
        </p>
        <p className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          {classItem.teacherCount} assigned teachers
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {classItem.startDate ?? "No start date"} to {classItem.endDate ?? "open"}
        </p>
      </div>
      <Button asChild className="mt-5 w-full" variant="outline">
        <Link href={`/classes/${classItem.id}`}>View class</Link>
      </Button>
    </article>
  );
}
