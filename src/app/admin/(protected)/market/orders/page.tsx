import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function MarketOrdersPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="wallet"
      title="Orders & Transactions"
      description="Monitor marketplace orders, payments and fulfilment, and investigate disputes — arriving with the checkout and payments phase."
    />
  );
}
