import Link from "next/link";
import { AlertTriangle, CalendarDays, ClipboardCheck, HeartPulse, Phone, ReceiptText, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import type { StudentDetail } from "@/features/students/types";

type StudentDetailSectionsProps = {
  student: StudentDetail;
};

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">{children}</p>;
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
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
          <ReceiptText className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Billing summary</h2>
        </div>
        <div className="mt-4 space-y-3">
          {student.billingSummary ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <EmptyLine>{student.billingSummary.invoiceCount} invoices</EmptyLine>
                <EmptyLine>{student.billingSummary.paymentCount} payments</EmptyLine>
                <EmptyLine>{formatMoney(student.billingSummary.outstandingBalance)} outstanding</EmptyLine>
                <EmptyLine>{formatMoney(student.billingSummary.paidTotal)} paid</EmptyLine>
              </div>
              {student.billingSummary.recentInvoices.length > 0 ? (
                <div className="space-y-2">
                  {student.billingSummary.recentInvoices.map((invoice) => (
                    <article className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/45 p-4" key={invoice.id}>
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm capitalize text-muted-foreground">{invoice.status.replace("_", " ")} - due {invoice.dueDate}</p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/invoices/${invoice.id}`}>Open</Link>
                      </Button>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <EmptyLine>Finance visibility is limited to management roles.</EmptyLine>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Attendance history</h2>
        </div>
        <div className="mt-4 space-y-3">
          {student.attendanceHistory.length > 0 ? (
            student.attendanceHistory.map((item) => (
              <article className="rounded-md bg-muted/45 p-4" key={item.id}>
                <p className="font-semibold">{item.className}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.classCode} - {item.sessionDate}</p>
                <p className="mt-2 text-sm capitalize text-muted-foreground">{item.status} - session {item.sessionStatus}</p>
              </article>
            ))
          ) : (
            <EmptyLine>No attendance history recorded yet.</EmptyLine>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Enrollment summary</h2>
        </div>
        <div className="mt-4 space-y-3">
          {student.enrolments.length > 0 ? (
            student.enrolments.map((enrolment) => (
              <article className="rounded-md bg-muted/45 p-4" key={enrolment.id}>
                <p className="font-semibold">{enrolment.className}</p>
                <p className="mt-1 text-sm text-muted-foreground">{enrolment.courseName}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {enrolment.classCode} - {enrolment.status} since {enrolment.enrolmentDate}
                </p>
              </article>
            ))
          ) : (
            <EmptyLine>No class enrolments recorded yet.</EmptyLine>
          )}
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
