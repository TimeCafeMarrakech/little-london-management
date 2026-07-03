import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { ParentDetailSections } from "@/components/parents/parent-detail-sections";
import { ParentPortalAccountCard } from "@/components/parents/parent-portal-account-card";
import { ParentStatusForm } from "@/components/parents/parent-status-form";
import { Button } from "@/components/ui/button";
import { disableParentPortalAction, enableParentPortalAction, inviteParentToPortalAction, resetParentPortalPasswordAction, updateParentStatusAction } from "@/features/parents/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageParents, canReadParentModule, getParentDetail } from "@/services/parents/parent-service";

export const dynamic = "force-dynamic";

type ParentDetailPageProps = {
  params: Promise<{
    parentId: string;
  }>;
};

export default async function ParentDetailPage({ params }: ParentDetailPageProps) {
  const profile = await requireUserProfile();
  const { parentId } = await params;

  if (!canReadParentModule(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to the parent management module.</p>
      </section>
    );
  }

  const parent = await getParentDetail(profile, parentId);

  if (!parent) {
    notFound();
  }

  const canManage = canManageParents(profile);
  const statusAction = updateParentStatusAction.bind(null, parent.id);
  const inviteAction = inviteParentToPortalAction.bind(null, parent.id);
  const resetPasswordAction = resetParentPortalPasswordAction.bind(null, parent.id);
  const enablePortalAction = enableParentPortalAction.bind(null, parent.id);
  const disablePortalAction = disableParentPortalAction.bind(null, parent.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Parent profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{parent.fullName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {parent.phone} · Portal {parent.portalStatus.replaceAll("_", " ")} · {parent.status}
            </p>
          </div>
          {canManage ? (
            <Button asChild variant="outline">
              <Link href={`/parents/${parent.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit profile
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      {canManage ? <ParentStatusForm action={statusAction} parent={parent} /> : null}
      {canManage ? (
        <ParentPortalAccountCard
          parent={parent}
          inviteAction={inviteAction}
          resetPasswordAction={resetPasswordAction}
          enableAction={enablePortalAction}
          disableAction={disablePortalAction}
        />
      ) : null}
      <ParentDetailSections parent={parent} />
    </div>
  );
}
