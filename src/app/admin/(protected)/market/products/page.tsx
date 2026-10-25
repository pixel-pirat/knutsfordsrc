import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function MarketProductsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="storefront"
      title="Products & Services"
      description="Moderate product and service listings across all stores — arriving with the seller store and listings phase."
    />
  );
}
