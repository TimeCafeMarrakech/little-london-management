import { redirect } from "next/navigation";

import { EventsList, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalData } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

export default async function ParentEventBookingsPage() {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  const data = await getParentPortalData(profile);

  return (
    <div className="space-y-8">
      <ParentPortalHero title="Event Bookings" subtitle="Read-only bookings for workshops, holiday camps, birthdays, and special Little London activities." />
      <EventsList events={data.eventBookings} />
    </div>
  );
}
