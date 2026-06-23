import { redirect } from "next/navigation";

import { ClassesList, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalData } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

export default async function ParentClassesPage() {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  const data = await getParentPortalData(profile);

  return (
    <div className="space-y-8">
      <ParentPortalHero title="Classes & Enrolments" subtitle="View your children's active classes, enrolment status, and parent-visible teacher names." />
      <ClassesList classes={data.classes} />
    </div>
  );
}
