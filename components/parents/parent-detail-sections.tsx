import { Home, Mail, Phone, UsersRound } from "lucide-react";

import { ParentRelationshipManager } from "@/components/parents/parent-relationship-manager";
import type { ParentDetail } from "@/features/parents/types";

type ParentDetailSectionsProps = {
  parent: ParentDetail;
};

function EmptyLine({ children }: { children: string }) {
  return <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">{children}</p>;
}

export function ParentDetailSections({ parent }: ParentDetailSectionsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Contact information</h2>
        </div>
        <div className="mt-4 space-y-3">
          <EmptyLine>{parent.phone}</EmptyLine>
          <EmptyLine>{parent.alternatePhone ?? "No alternate phone recorded."}</EmptyLine>
          <p className="flex items-center gap-2 rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {parent.email ?? "No email recorded."}
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Home className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Address</h2>
        </div>
        <div className="mt-4 space-y-3">
          <EmptyLine>{parent.addressLine1 ?? "No address line 1 recorded."}</EmptyLine>
          <EmptyLine>{parent.addressLine2 ?? "No address line 2 recorded."}</EmptyLine>
          <EmptyLine>{[parent.city, parent.country].filter(Boolean).join(", ")}</EmptyLine>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft lg:col-span-2">
        <div className="flex items-center gap-3">
          <UsersRound className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Linked students</h2>
        </div>
        <div className="mt-4">
          <ParentRelationshipManager parentId={parent.id} linkedStudents={parent.linkedStudents} availableStudents={parent.availableStudents} />
        </div>
      </section>
    </div>
  );
}
