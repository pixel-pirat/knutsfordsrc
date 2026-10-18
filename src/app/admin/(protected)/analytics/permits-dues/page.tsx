import { getCurrentAdmin } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function PermitsDuesAnalyticsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="wallet"
      title="Permit / Dues Analytics"
      description="Deeper trends across permit issuance and dues collection — coming soon. Current totals are on the Overview page."
    />
  );
}
