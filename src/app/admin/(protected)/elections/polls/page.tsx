import { getCurrentAdmin } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function PollsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="vote"
      title="Polls"
      description="Lightweight, quick-turnaround polls outside the formal election process — coming soon."
    />
  );
}
