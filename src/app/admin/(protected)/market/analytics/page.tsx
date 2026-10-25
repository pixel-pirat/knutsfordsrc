import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function MarketAnalyticsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="dashboard"
      title="Marketplace Analytics"
      description="Sales, listings and marketplace activity across all stores — arriving once orders are live."
    />
  );
}
