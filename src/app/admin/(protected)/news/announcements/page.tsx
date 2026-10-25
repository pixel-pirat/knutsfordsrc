import { getCurrentAdmin } from "@/db/adminQueries";
import { listAnnouncementsForAdmin } from "@/db/announcementQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { AnnouncementsClient } from "./AnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_news")) {
    return <AccessRestricted />;
  }

  const announcements = await listAnnouncementsForAdmin();

  return (
    <AnnouncementsClient
      announcements={announcements.map((a) => ({
        id: a.id,
        text: a.text,
        linkUrl: a.linkUrl,
        active: a.active,
      }))}
    />
  );
}
