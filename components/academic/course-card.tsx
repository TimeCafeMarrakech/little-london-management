import Link from "next/link";
import { Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseListItem } from "@/features/academic/types";

type CourseCardProps = {
  course: CourseListItem;
};

const statusStyles: Record<CourseListItem["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  archived: "bg-destructive/10 text-destructive",
};

export function CourseCard({ course }: CourseCardProps) {
  const ageRange = course.minimumAge || course.maximumAge ? `${course.minimumAge ?? 0}-${course.maximumAge ?? "open"} years` : "No age range";

  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent">{course.courseCode}</p>
          <h2 className="mt-2 truncate text-lg font-semibold">{course.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{course.level ?? "No level recorded"} - {ageRange}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[course.status]}`}>{course.status}</span>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{course.description ?? "No course description recorded yet."}</p>
      <div className="mt-5 flex items-center gap-2 rounded-md bg-muted/45 px-3 py-2 text-sm text-muted-foreground">
        <Layers3 className="h-4 w-4" aria-hidden="true" />
        {course.classCount} linked classes
      </div>
      <Button asChild className="mt-5 w-full" variant="outline">
        <Link href={`/courses/${course.id}`}>View course</Link>
      </Button>
    </article>
  );
}
