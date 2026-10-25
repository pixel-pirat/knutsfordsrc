import type { Metadata } from "next";
import { Storefront } from "@/components/market/Storefront";
import { getPublicStoreBySlug } from "@/db/marketplacePublicQueries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getPublicStoreBySlug(slug);

  return {
    title: store
      ? `${store.name} | Knutsford Marketplace`
      : "Student Store | Knutsford Marketplace",
    description:
      store?.description ??
      "Shop products and services from a verified Knutsford student store.",
  };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <Storefront slug={slug} basePath="/market" />
      </div>
    </section>
  );
}
