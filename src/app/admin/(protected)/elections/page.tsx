import { getCurrentAdmin } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function ElectionsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="vote"
      title="Elections"
      description="Run SRC elections — positions, candidates and ballots — coming soon."
    />
  );
}
