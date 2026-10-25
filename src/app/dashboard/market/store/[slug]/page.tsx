import { Storefront } from "@/components/market/Storefront";

export const dynamic = "force-dynamic";

export default async function DashboardStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <Storefront slug={slug} basePath="/dashboard/market" />;
}
