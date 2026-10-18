import {
  getCurrentAdmin,
  listYearGroupsForAdmin,
  listProfilesForAdmin,
  listAdmins,
} from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { ProfilesTable } from "./ProfilesTable";

export default async function ExecutiveProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ yearGroup?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_executives")) {
    return <AccessRestricted />;
  }

  const { yearGroup } = await searchParams;
  const [yearGroups, profiles, admins] = await Promise.all([
    listYearGroupsForAdmin(),
    listProfilesForAdmin(yearGroup),
    listAdmins(),
  ]);

  return (
    <ProfilesTable
      profiles={profiles.map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        avatarUrl: p.avatarUrl,
        yearGroup: p.yearGroup,
        adminUser: p.adminUser,
      }))}
      yearGroups={yearGroups.map((yg) => ({ id: yg.id, label: yg.label }))}
      admins={admins.map((a) => ({ id: a.id, name: a.name, email: a.email }))}
      selectedYearGroupId={yearGroup ?? ""}
    />
  );
}
