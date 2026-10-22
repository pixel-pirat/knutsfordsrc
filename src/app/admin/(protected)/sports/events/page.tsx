import { getCurrentAdmin } from "@/db/adminQueries";
import { listSportEventsForAdmin } from "@/db/sportsQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { SportEventsTable } from "./SportEventsTable";

export default async function AdminSportEventsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_sports")) {
    return <AccessRestricted />;
  }

  const events = await listSportEventsForAdmin();

  return (
    <SportEventsTable
      events={events.map((e) => ({
        id: e.id,
        title: e.title,
        sport: e.sport,
        venue: e.venue,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt ? e.endsAt.toISOString() : null,
        published: e.published,
        registrationCount: e.registrationCount,
        confirmedCount: e.confirmedCount,
      }))}
    />
  );
}
