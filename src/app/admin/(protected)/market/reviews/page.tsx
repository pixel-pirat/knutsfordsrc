import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function MarketReviewsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="trophy"
      title="Reviews & Reports"
      description="Customer reviews of completed orders, with moderation and seller reporting — arriving after the orders phase."
    />
  );
}
