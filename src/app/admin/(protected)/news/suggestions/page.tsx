import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function SuggestionBoxPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_news")) {
    return <AccessRestricted />;
  }

  return (
    <PlaceholderPage
      icon="flag"
      title="Suggestion Box"
      description="Student ideas and suggestions, with a review workflow — coming soon."
    />
  );
}
