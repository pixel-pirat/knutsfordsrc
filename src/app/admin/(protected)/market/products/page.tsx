import { getCurrentAdmin } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function MarketProductsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="storefront"
      title="Products"
      description="Review and approve marketplace listings — coming soon."
    />
  );
}
