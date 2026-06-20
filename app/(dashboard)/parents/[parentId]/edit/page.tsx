import Link from "next/link";
import { notFound } from "next/navigation";

import { ParentForm } from "@/components/parents/parent-form";
import { Button } from "@/components/ui/button";
import { updateParentAction } from "@/features/parents/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageParents, getParentDetail } from "@/services/parents/parent-service";

export const dynamic = "force-dynamic";

type EditParentPageProps = {
  params: Promise<{
    parentId: string;
  }>;
};

export default async function EditParentPage({ params }: EditParentPageProps) {
  const profile = await requireUserProfile();
  const { parentId } = await params;

  if (!canManageParents(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can edit parent profiles.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href={`/parents/${parentId}`}>Back to parent</Link>
        </Button>
      </section>
    );
  }

  const parent = await getParentDetail(profile, parentId);

  if (!parent) {
    notFound();
  }

  const action = updateParentAction.bind(null, parent.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Edit parent</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{parent.fullName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Update parent contact details and portal status.</p>
      </section>
      <ParentForm action={action} mode="edit" parent={parent} />
    </div>
  );
}
