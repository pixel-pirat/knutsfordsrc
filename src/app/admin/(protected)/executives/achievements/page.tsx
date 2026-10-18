import {
  getCurrentAdmin,
  listYearGroupsForAdmin,
  listAchievementsForAdmin,
  listProfilesForAdmin,
} from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { AchievementsTable } from "./AchievementsTable";

export default async function ExecutiveAchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ yearGroup?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_executives")) {
    return <AccessRestricted />;
  }

  const { yearGroup } = await searchParams;
  const [yearGroups, achievements, profiles] = await Promise.all([
    listYearGroupsForAdmin(),
    listAchievementsForAdmin({ yearGroupId: yearGroup }),
    listProfilesForAdmin(),
  ]);

  return (
    <AchievementsTable
      achievements={achievements.map((a) => ({
        id: a.id,
        title: a.title,
        achievedAt: a.achievedAt ? a.achievedAt.toISOString() : null,
        yearGroup: a.yearGroup,
        profile: a.profile,
      }))}
      yearGroups={yearGroups.map((yg) => ({ id: yg.id, label: yg.label }))}
      profiles={profiles.map((p) => ({ id: p.id, name: p.name, yearGroupId: p.yearGroupId }))}
      selectedYearGroupId={yearGroup ?? ""}
    />
  );
}
