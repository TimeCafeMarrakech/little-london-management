import { AlertTriangle, CalendarDays, HeartPulse, Phone, Users } from "lucide-react";

import type { StudentDetail } from "@/features/students/types";

type StudentDetailSectionsProps = {
  student: StudentDetail;
};

function EmptyLine({ children }: { children: string }) {
  return <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">{children}</p>;
}

export function StudentDetailSections({ student }: StudentDetailSectionsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Parent relationships</h2>
        </div>
        <div className="mt-4 space-y-3">
          {student.parents.length > 0 ? (
            student.parents.map((parent) => (
              <article className="rounded-md bg-muted/45 p-4" key={parent.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{parent.parentFullName}</p>
                  {parent.isPrimaryContact ? <span className="rounded-full bg-secondary/30 px-2 py-1 text-xs font-semibold text-primary">Primary</span> : null}
                </div>
                <p className="mt-1 text-sm capitalize text-muted-foreground">{parent.relationshipType}</p>
                <p className="mt-2 text-sm text-muted-foreground">{parent.parentPhone ?? "No phone recorded"}</p>
                <p className="text-sm text-muted-foreground">{parent.parentEmail ?? "No email recorded"}</p>
              </article>
            ))
          ) : (
            <EmptyLine>No parent relationship has been added yet.</EmptyLine>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Enrollment summary</h2>
        </div>
        <div className="mt-4 rounded-md bg-muted/45 p-4">
          <p className="font-semibold">Enrollment details arrive in Phase 7.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This placeholder keeps the student profile ready for course and class assignments without building those modules early.
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Medical information</h2>
        </div>
        <div className="mt-4 space-y-3">
          <EmptyLine>{student.medicalNotes ?? "No general medical notes recorded."}</EmptyLine>
          <EmptyLine>{student.medicalProfile?.medicalConditions ?? "No medical conditions recorded."}</EmptyLine>
          <EmptyLine>{student.medicalProfile?.dietaryRequirements ?? "No dietary requirements recorded."}</EmptyLine>
          <p className="text-sm text-muted-foreground">
            Emergency consent: {student.medicalProfile?.emergencyMedicalConsent ? "Recorded" : "Not recorded"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Allergies</h2>
        </div>
        <div className="mt-4 space-y-3">
          {student.allergies.length > 0 ? (
            student.allergies.map((allergy) => (
              <article className="rounded-md bg-muted/45 p-4" key={allergy.id}>
                <p className="font-semibold">{allergy.allergen}</p>
                <p className="mt-1 text-sm capitalize text-muted-foreground">Severity: {allergy.severity}</p>
                <p className="mt-2 text-sm text-muted-foreground">{allergy.reaction ?? "No reaction notes recorded."}</p>
              </article>
            ))
          ) : (
            <EmptyLine>No allergies recorded.</EmptyLine>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft lg:col-span-2">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Emergency contacts</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {student.emergencyContacts.length > 0 ? (
            student.emergencyContacts.map((contact) => (
              <article className="rounded-md bg-muted/45 p-4" key={contact.id}>
                <p className="font-semibold">{contact.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{contact.relationship}</p>
                <p className="mt-2 text-sm font-medium">{contact.phone}</p>
                <p className="text-sm text-muted-foreground">{contact.notes ?? "No extra notes."}</p>
              </article>
            ))
          ) : (
            <EmptyLine>No emergency contacts recorded.</EmptyLine>
          )}
        </div>
      </section>
    </div>
  );
}
