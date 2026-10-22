import { getCurrentAdmin } from "@/db/adminQueries";
import { listSportAnnouncementsForAdmin } from "@/db/sportsQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { AnnouncementsClient } from "./AnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_sports")) {
    return <AccessRestricted />;
  }

  const announcements = await listSportAnnouncementsForAdmin();

  return (
    <AnnouncementsClient
      announcements={announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        eventId: a.eventId,
        eventTitle: a.eventTitle,
        recipientCount: a.recipientCount,
        failedCount: a.failedCount,
        sentAt: a.sentAt.toISOString(),
      }))}
    />
  );
}
