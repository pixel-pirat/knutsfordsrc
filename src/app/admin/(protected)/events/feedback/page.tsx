import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function EventsFeedbackPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_events")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="flag"
      title="Event Feedback"
      description="Post-event ratings and comments from attendees — coming soon."
    />
  );
}
