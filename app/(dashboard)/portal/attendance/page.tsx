import { redirect } from "next/navigation";

import { AttendanceList, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalData } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

export default async function ParentAttendancePage() {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  const data = await getParentPortalData(profile);

  return (
    <div className="space-y-8">
      <ParentPortalHero title="Attendance History" subtitle="Submitted attendance records for your own linked children." />
      <AttendanceList records={data.attendance} />
    </div>
  );
}
