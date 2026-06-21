import Link from "next/link";
import { Home, Mail, Phone, ReceiptText, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { ParentRelationshipManager } from "@/components/parents/parent-relationship-manager";
import { Button } from "@/components/ui/button";
import type { ParentDetail } from "@/features/parents/types";

type ParentDetailSectionsProps = {
  parent: ParentDetail;
};

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">{children}</p>;
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
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
          <ReceiptText className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Billing summary</h2>
        </div>
        <div className="mt-4 space-y-3">
          {parent.billingSummary ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <EmptyLine>{parent.billingSummary.invoiceCount} invoices</EmptyLine>
                <EmptyLine>{parent.billingSummary.paymentCount} payments</EmptyLine>
                <EmptyLine>{formatMoney(parent.billingSummary.outstandingBalance)} outstanding</EmptyLine>
                <EmptyLine>{formatMoney(parent.billingSummary.paidTotal)} paid</EmptyLine>
              </div>
              {parent.billingSummary.recentInvoices.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {parent.billingSummary.recentInvoices.map((invoice) => (
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
