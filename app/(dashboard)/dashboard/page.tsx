import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ParentDashboardOverview, ParentDashboardPanels, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalData } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireUserProfile();

  if (profile.role === "parent") {
    const data = await getParentPortalData(profile);

    return (
      <div className="space-y-8">
        <ParentPortalHero title="Your Little London family dashboard" subtitle="A calm read-only overview of your children, classes, attendance, balances, and booked activities." />
        <ParentDashboardOverview data={data} />
        <ParentDashboardPanels data={data} />
      </div>
    );
  }

  return <DashboardContent profile={profile} />;
}
