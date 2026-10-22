import { getCurrentAdmin } from "@/db/adminQueries";
import { listHallEventsForAdmin } from "@/db/hallQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { HallEventsTable } from "./HallEventsTable";

export default async function AdminHallEventsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_hall_events")) {
    return <AccessRestricted />;
  }

  const events = await listHallEventsForAdmin();

  return (
    <HallEventsTable
      events={events.map((e) => ({
        id: e.id,
        title: e.title,
        hallId: e.hallId,
        hallName: e.hallName,
        location: e.location,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt ? e.endsAt.toISOString() : null,
        capacity: e.capacity,
        bookingRequired: e.bookingRequired,
        published: e.published,
        bookingCount: e.bookingCount,
      }))}
    />
  );
}
