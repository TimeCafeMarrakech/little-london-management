import { redirect } from "next/navigation";

import { EventsList, ParentPortalHero } from "@/components/parent-portal/parent-portal-ui";
import { requireUserProfile } from "@/lib/auth/session";
import { getParentPortalData } from "@/services/parent-portal/parent-portal-service";

export const dynamic = "force-dynamic";

export default async function ParentUpcomingEventsPage() {
  const profile = await requireUserProfile();

  if (profile.role !== "parent") {
    redirect("/access-denied");
  }

  const data = await getParentPortalData(profile);
  const upcomingEvents = data.eventBookings
    .filter((event) => event.startDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="space-y-8">
      <ParentPortalHero title="Upcoming Events" subtitle="Booked upcoming activities for your own children. Booking requests are not included in this MVP." />
      <EventsList events={upcomingEvents} title="Upcoming events" />
    </div>
  );
}
