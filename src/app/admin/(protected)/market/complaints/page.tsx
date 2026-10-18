import { getCurrentAdmin } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function MarketComplaintsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="flag"
      title="Market Complaints"
      description="Student-reported issues with marketplace listings or sellers — coming soon."
    />
  );
}
