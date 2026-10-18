import { getCurrentAdmin, listEventsForAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { EventsTable } from "./EventsTable";

export default async function AdminEventsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_events")) {
    return <AccessRestricted />;
  }

  const events = await listEventsForAdmin();

  return (
    <EventsTable
      events={events.map((e) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt ? e.endsAt.toISOString() : null,
        published: e.published,
      }))}
    />
  );
}
