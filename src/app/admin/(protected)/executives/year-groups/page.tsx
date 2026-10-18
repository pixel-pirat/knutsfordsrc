import { getCurrentAdmin, listYearGroupsForAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { YearGroupsTable } from "./YearGroupsTable";

export default async function YearGroupsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_executives")) {
    return <AccessRestricted />;
  }

  const yearGroups = await listYearGroupsForAdmin();

  return (
    <YearGroupsTable
      yearGroups={yearGroups.map((yg) => ({
        id: yg.id,
        label: yg.label,
        description: yg.description,
        active: yg.active,
      }))}
    />
  );
}
