import { notFound } from "next/navigation";

import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { CashbookTargetForm } from "@/components/cashbook/cashbook-target-form";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canManageBusinessTargets,
  getCashbookTargetDetail,
  listCashbookBusinessAreas,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

type EditCashbookTargetPageProps = {
  params: Promise<{ targetId: string }>;
};

export default async function EditCashbookTargetPage({ params }: EditCashbookTargetPageProps) {
  const profile = await requireUserProfile();

  if (!canManageBusinessTargets(profile)) {
    return <CashbookErrorState title="Access denied" message="You do not have permission to edit monthly targets." />;
  }

  const { targetId } = await params;
  const target = await getCashbookTargetDetail(profile, targetId);

  if (!target) {
    notFound();
  }

  if (target.status !== "active" || target.deletedAt) {
    return <CashbookErrorState title="Target locked" message="Only active targets can be edited." />;
  }

  const businessAreas = await listCashbookBusinessAreas(profile);

  return (
    <div className="space-y-6">
      <CashbookTabs active="targets" />
      <section className="rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Cashbook</p>
        <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">Edit Monthly Target</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#5b6f82]">
          Update the target while it remains active. Archived targets are preserved for history.
        </p>
      </section>
      <CashbookTargetForm businessAreas={businessAreas} target={target} />
    </div>
  );
}
