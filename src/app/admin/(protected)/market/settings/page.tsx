import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function MarketSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="gear"
      title="Marketplace Settings"
      description="Configure prohibited items, seller obligations, complaint timelines and suspension policies — arriving in a later phase."
    />
  );
}
