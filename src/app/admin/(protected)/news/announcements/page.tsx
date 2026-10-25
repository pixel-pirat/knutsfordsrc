import { getCurrentAdmin } from "@/db/adminQueries";
import {
  getAnnouncementStatus,
  getTickerSpeed,
  listAnnouncementsForAdmin,
} from "@/db/announcementQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { AnnouncementsClient } from "./AnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_news")) {
    return <AccessRestricted />;
  }

  const [announcements, tickerSpeed] = await Promise.all([
    listAnnouncementsForAdmin(),
    getTickerSpeed(),
  ]);

  return (
    <AnnouncementsClient
      announcements={announcements.map((a) => ({
        id: a.id,
        text: a.text,
        linkUrl: a.linkUrl,
        active: a.active,
        startsAt: a.startsAt ? a.startsAt.toISOString() : null,
        endsAt: a.endsAt ? a.endsAt.toISOString() : null,
        status: getAnnouncementStatus(a),
      }))}
      tickerSpeed={tickerSpeed}
    />
  );
}
