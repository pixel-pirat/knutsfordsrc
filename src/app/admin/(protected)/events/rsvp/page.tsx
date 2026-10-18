import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function EventsRsvpPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_events")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="users"
      title="RSVP / Bookings"
      description="Who's registered for which event — coming soon. Events themselves don't yet accept RSVPs from students."
    />
  );
}
