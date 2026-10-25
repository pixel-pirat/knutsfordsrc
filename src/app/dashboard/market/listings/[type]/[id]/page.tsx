import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/market/ListingDetail";
import type { MarketplaceListingType } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

function listingType(value: string): MarketplaceListingType | null {
  return value === "product" || value === "service" ? value : null;
}

export default async function DashboardListingDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type: rawType, id } = await params;
  const type = listingType(rawType);
  if (!type) notFound();

  return <ListingDetail type={type} id={id} basePath="/dashboard/market" />;
}
