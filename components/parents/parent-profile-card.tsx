import Link from "next/link";
import { Mail, Phone, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ParentListItem } from "@/features/parents/types";
import { cn } from "@/lib/utils";

type ParentProfileCardProps = {
  parent: ParentListItem;
};

const statusStyles: Record<ParentListItem["status"], string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-300",
  inactive: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  archived: "bg-muted text-muted-foreground",
};

export function ParentProfileCard({ parent }: ParentProfileCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {parent.firstName.charAt(0)}
          {parent.lastName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{parent.fullName}</h2>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", statusStyles[parent.status])}>
              {parent.status}
            </span>
          </div>
          <p className="mt-1 text-sm capitalize text-muted-foreground">Portal: {parent.portalStatus.replaceAll("_", " ")}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-md bg-muted/45 p-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Phone
          </dt>
          <dd className="mt-1 truncate font-semibold">{parent.phone}</dd>
        </div>
        <div className="rounded-md bg-muted/45 p-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email
          </dt>
          <dd className="mt-1 truncate font-semibold">{parent.email ?? "None"}</dd>
        </div>
        <div className="rounded-md bg-muted/45 p-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            Children
          </dt>
          <dd className="mt-1 font-semibold">{parent.linkedStudentCount}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{parent.city ?? "No city recorded"}</p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/parents/${parent.id}`}>View profile</Link>
        </Button>
      </div>
    </article>
  );
}
