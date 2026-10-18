import { getCurrentAdmin, listNewsForAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { NewsTable } from "./NewsTable";

export default async function AdminNewsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_news")) {
    return <AccessRestricted />;
  }

  const news = await listNewsForAdmin();

  return (
    <NewsTable
      news={news.map((n) => ({
        id: n.id,
        title: n.title,
        publishedAt: n.publishedAt.toISOString(),
        published: n.published,
      }))}
    />
  );
}
