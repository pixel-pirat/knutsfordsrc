import { getCurrentAdmin } from "@/db/adminQueries";
import { listHallMessagesForAdmin } from "@/db/hallQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { CommunicationsClient } from "./CommunicationsClient";

export default async function AdminCommunicationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_hall_comms")) {
    return <AccessRestricted />;
  }

  const messages = await listHallMessagesForAdmin();

  return (
    <CommunicationsClient
      messages={messages.map((m) => ({
        id: m.id,
        subject: m.subject,
        body: m.body,
        hallName: m.hallName,
        recipientCount: m.recipientCount,
        failedCount: m.failedCount,
        sentAt: m.sentAt.toISOString(),
      }))}
    />
  );
}
