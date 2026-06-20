import { BriefcaseBusiness, CalendarDays, Mail, NotebookText, Phone, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import type { TeacherDetail } from "@/features/teachers/types";

type TeacherDetailSectionsProps = {
  teacher: TeacherDetail;
};

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-muted/45 px-4 py-3 text-sm leading-6 text-muted-foreground">{children}</p>;
}

function formatEmploymentType(value: TeacherDetail["employmentType"]): string {
  return value.replaceAll("_", " ");
}

export function TeacherDetailSections({ teacher }: TeacherDetailSectionsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Contact information</h2>
        </div>
        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-2 rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {teacher.email ?? "No email recorded."}
          </p>
          <EmptyLine>{teacher.phone ?? "No phone recorded."}</EmptyLine>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <BriefcaseBusiness className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Employment information</h2>
        </div>
        <div className="mt-4 space-y-3">
          <EmptyLine>Employment: {formatEmploymentType(teacher.employmentType)}</EmptyLine>
          <p className="flex items-center gap-2 rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Hire date: {teacher.hireDate ?? "Not recorded"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Qualifications</h2>
        </div>
        <div className="mt-4">
          <EmptyLine>{teacher.qualifications ?? "No qualifications recorded yet."}</EmptyLine>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <NotebookText className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Availability</h2>
        </div>
        <div className="mt-4">
          <EmptyLine>{teacher.availabilityNotes ?? "No availability notes recorded yet."}</EmptyLine>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft lg:col-span-2">
        <h2 className="text-lg font-semibold">Bio</h2>
        <div className="mt-4">
          <EmptyLine>{teacher.bio ?? "No teacher bio recorded yet."}</EmptyLine>
        </div>
      </section>
    </div>
  );
}
