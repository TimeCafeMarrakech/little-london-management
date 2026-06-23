import { redirect } from "next/navigation";

import { FinanceView, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalData } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

export default async function ParentFinancePage() {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  const data = await getParentPortalData(profile);

  return (
    <div className="space-y-8">
      <ParentPortalHero title="Finance" subtitle="Read-only invoices, payments, and outstanding family balance." />
      <FinanceView finance={data.finance} />
    </div>
  );
}
