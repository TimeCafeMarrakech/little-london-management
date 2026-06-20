import Link from "next/link";

import { ParentForm } from "@/components/parents/parent-form";
import { Button } from "@/components/ui/button";
import { createParentAction } from "@/features/parents/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageParents } from "@/services/parents/parent-service";

export const dynamic = "force-dynamic";

export default async function NewParentPage() {
  const profile = await requireUserProfile();

  if (!canManageParents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can create parent profiles.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/parents">Back to parents</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">New parent</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Create parent profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Add normalized parent contact details. Student links are displayed from existing parent-student relationships.
        </p>
      </section>
      <ParentForm action={createParentAction} mode="create" />
    </div>
  );
}
