import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/market/ListingDetail";
import { getPublicListing } from "@/db/marketplacePublicQueries";
import type { MarketplaceListingType } from "@/lib/marketplace";
import { formatCurrency } from "@/lib/permits";

export const dynamic = "force-dynamic";

function listingType(value: string): MarketplaceListingType | null {
  return value === "product" || value === "service" ? value : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
  const { type: rawType, id } = await params;
  const type = listingType(rawType);
  if (!type) return { title: "Listing | Knutsford Marketplace" };

  const data = await getPublicListing(type, id);
  if (!data) return { title: "Listing | Knutsford Marketplace" };

  return {
    title: `${data.listing.name} | ${data.listing.store.name}`,
    description: `${formatCurrency(data.listing.price)} · ${data.listing.description.slice(0, 150)}`,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type: rawType, id } = await params;
  const type = listingType(rawType);
  if (!type) notFound();

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <ListingDetail type={type} id={id} basePath="/market" />
      </div>
    </section>
  );
}
