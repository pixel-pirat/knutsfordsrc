import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function NewsDocumentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_news")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="book"
      title="Documents"
      description="A document library students can browse and download — coming soon."
    />
  );
}
