import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { requireUserProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireUserProfile();

  return <DashboardContent profile={profile} />;
}
