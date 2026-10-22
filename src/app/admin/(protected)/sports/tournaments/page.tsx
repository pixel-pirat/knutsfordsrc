import { getCurrentAdmin } from "@/db/adminQueries";
import { listTournaments } from "@/db/sportsQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { TournamentsTable } from "./TournamentsTable";

export default async function AdminTournamentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_sports")) {
    return <AccessRestricted />;
  }

  const tournaments = await listTournaments();

  return (
    <TournamentsTable
      tournaments={tournaments.map((t) => ({
        id: t.id,
        name: t.name,
        sport: t.sport,
        format: t.format,
        status: t.status,
        championName: t.championName,
        eventTitle: t.eventTitle,
        participantCount: t.participantCount,
        matchCount: t.matchCount,
      }))}
    />
  );
}
