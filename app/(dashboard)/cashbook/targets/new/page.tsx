import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { CashbookTargetForm } from "@/components/cashbook/cashbook-target-form";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageBusinessTargets, listCashbookBusinessAreas } from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

export default async function NewCashbookTargetPage() {
  const profile = await requireUserProfile();

  if (!canManageBusinessTargets(profile)) {
    return <CashbookErrorState title="Access denied" message="You do not have permission to create monthly targets." />;
  }

  const businessAreas = await listCashbookBusinessAreas(profile);

  return (
    <div className="space-y-6">
      <CashbookTabs active="targets" />
      <section className="rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Cashbook</p>
        <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">Create Monthly Target</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#5b6f82]">
          Set a monthly target for the whole business or a specific business area.
        </p>
      </section>
      <CashbookTargetForm businessAreas={businessAreas} />
    </div>
  );
}
