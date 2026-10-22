import { getCurrentAdmin } from "@/db/adminQueries";
import { listHallsWithCounts } from "@/db/hallQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { HallsTable } from "./HallsTable";

export default async function AdminHallsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_halls")) {
    return <AccessRestricted />;
  }

  const halls = await listHallsWithCounts();

  return (
    <HallsTable
      halls={halls.map((h) => ({
        id: h.id,
        name: h.name,
        wardenName: h.wardenName,
        location: h.location,
        capacity: h.capacity,
        active: h.active,
        memberCount: h.memberCount,
        eventCount: h.eventCount,
      }))}
      canDelete={admin.role === "super_admin"}
    />
  );
}
