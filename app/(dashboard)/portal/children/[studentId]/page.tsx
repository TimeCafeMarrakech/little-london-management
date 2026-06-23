import { notFound, redirect } from "next/navigation";

import { ChildProfileSummary, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalChild } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

type ParentChildProfilePageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function ParentChildProfilePage({ params }: ParentChildProfilePageProps) {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  const { studentId } = await params;
  const data = await getParentPortalChild(profile, studentId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <ParentPortalHero title={data.child.fullName} subtitle="A parent-safe read-only profile summary for your child." />
      <ChildProfileSummary child={data.child} classes={data.classes} attendance={data.attendance} finance={data.finance} events={data.eventBookings} />
    </div>
  );
}
