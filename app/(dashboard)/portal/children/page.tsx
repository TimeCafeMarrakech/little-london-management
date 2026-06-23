import { redirect } from "next/navigation";

import { ChildrenGrid, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalData } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

export default async function ParentChildrenPage() {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  const data = await getParentPortalData(profile);

  return (
    <div className="space-y-8">
      <ParentPortalHero title="My Children" subtitle="Read-only child profile summaries linked to your Little London parent account." />
      <ChildrenGrid items={data.children} />
    </div>
  );
}
