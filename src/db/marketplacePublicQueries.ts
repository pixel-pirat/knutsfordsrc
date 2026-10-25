import { and, eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  marketplaceProducts,
  marketplaceServices,
  marketplaceStores,
  students,
} from "./schema";
import type {
  MarketplaceListingType,
  PublicListing,
  PublicStore,
  PublicStoreInfo,
} from "@/lib/marketplace";

type ListingQuery = {
  storeId?: string;
  id?: string;
  type?: MarketplaceListingType;
};

export type MarketplaceBrowseFilters = {
  q?: string;
  type?: MarketplaceListingType;
  category?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
};

const storeColumns = {
  storeId: marketplaceStores.id,
  storeName: marketplaceStores.name,
  storeSlug: marketplaceStores.slug,
  storeDescription: marketplaceStores.description,
  storeLogoUrl: marketplaceStores.logoUrl,
  storeCategory: marketplaceStores.category,
  storeContactEmail: marketplaceStores.contactEmail,
  storeContactPhone: marketplaceStores.contactPhone,
  storeFulfilmentMethods: marketplaceStores.fulfilmentMethods,
  storeOperatingHours: marketplaceStores.operatingHours,
  storePickupLocation: marketplaceStores.pickupLocation,
  sellerFirstName: students.firstName,
  sellerProgram: students.program,
  sellerLevel: students.level,
};

type StoreColumns = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string | null;
  storeLogoUrl: string | null;
  storeCategory: string;
  storeContactEmail: string | null;
  storeContactPhone: string | null;
  storeFulfilmentMethods: string[];
  storeOperatingHours: string | null;
  storePickupLocation: string | null;
  sellerFirstName: string;
  sellerProgram: string | null;
  sellerLevel: string | null;
};

function mapStore(row: StoreColumns): PublicStoreInfo {
  return {
    id: row.storeId,
    name: row.storeName,
    slug: row.storeSlug,
    description: row.storeDescription,
    logoUrl: row.storeLogoUrl,
    category: row.storeCategory,
    contactEmail: row.storeContactEmail,
    contactPhone: row.storeContactPhone,
    fulfilmentMethods: row.storeFulfilmentMethods,
    operatingHours: row.storeOperatingHours,
    pickupLocation: row.storePickupLocation,
    sellerFirstName: row.sellerFirstName,
    sellerProgram: row.sellerProgram,
    sellerLevel: row.sellerLevel,
  };
}

function activeProductWhere(query: ListingQuery) {
  return and(
    eq(marketplaceProducts.published, true),
    eq(marketplaceProducts.moderationStatus, "active"),
    eq(marketplaceStores.status, "active"),
    query.storeId ? eq(marketplaceProducts.storeId, query.storeId) : undefined,
    query.id ? eq(marketplaceProducts.id, query.id) : undefined
  );
}

function activeServiceWhere(query: ListingQuery) {
  return and(
    eq(marketplaceServices.published, true),
    eq(marketplaceServices.moderationStatus, "active"),
    eq(marketplaceStores.status, "active"),
    query.storeId ? eq(marketplaceServices.storeId, query.storeId) : undefined,
    query.id ? eq(marketplaceServices.id, query.id) : undefined
  );
}

export async function listPublicListings(
  query: ListingQuery = {}
): Promise<PublicListing[]> {
  const shouldQueryProducts = !query.type || query.type === "product";
  const shouldQueryServices = !query.type || query.type === "service";

  const [productRows, serviceRows] = await Promise.all([
    shouldQueryProducts
      ? db
          .select({
            id: marketplaceProducts.id,
            name: marketplaceProducts.name,
            description: marketplaceProducts.description,
            category: marketplaceProducts.category,
            imageUrl: marketplaceProducts.imageUrl,
            price: marketplaceProducts.price,
            discountPrice: marketplaceProducts.discountPrice,
            stockQuantity: marketplaceProducts.stockQuantity,
            availability: marketplaceProducts.availability,
            fulfilmentMethods: marketplaceProducts.fulfilmentMethods,
            createdAt: marketplaceProducts.createdAt,
            ...storeColumns,
          })
          .from(marketplaceProducts)
          .innerJoin(
            marketplaceStores,
            eq(marketplaceProducts.storeId, marketplaceStores.id)
          )
          .innerJoin(students, eq(marketplaceStores.studentId, students.id))
          .where(activeProductWhere(query))
      : Promise.resolve([]),
    shouldQueryServices
      ? db
          .select({
            id: marketplaceServices.id,
            name: marketplaceServices.name,
            description: marketplaceServices.description,
            category: marketplaceServices.category,
            imageUrl: marketplaceServices.imageUrl,
            price: marketplaceServices.price,
            pricingUnit: marketplaceServices.pricingUnit,
            durationMinutes: marketplaceServices.durationMinutes,
            availability: marketplaceServices.availability,
            bookingRequired: marketplaceServices.bookingRequired,
            deliveryMethod: marketplaceServices.deliveryMethod,
            createdAt: marketplaceServices.createdAt,
            ...storeColumns,
          })
          .from(marketplaceServices)
          .innerJoin(
            marketplaceStores,
            eq(marketplaceServices.storeId, marketplaceStores.id)
          )
          .innerJoin(students, eq(marketplaceStores.studentId, students.id))
          .where(activeServiceWhere(query))
      : Promise.resolve([]),
  ]);

  const products: PublicListing[] = productRows.map((row) => {
    const price = Number(row.price);
    const discountPrice =
      row.discountPrice === null ? null : Number(row.discountPrice);

    return {
      key: `product:${row.id}`,
      id: row.id,
      type: "product",
      name: row.name,
      description: row.description,
      category: row.category,
      imageUrl: row.imageUrl,
      price: discountPrice ?? price,
      compareAtPrice: discountPrice === null ? null : price,
      priceUnit: null,
      durationMinutes: null,
      stockQuantity: row.stockQuantity,
      availability: row.availability,
      inStock:
        row.availability !== "ready_stock" || row.stockQuantity > 0,
      bookingRequired: false,
      deliveryMethod: null,
      fulfilmentMethods: row.fulfilmentMethods,
      createdAt: row.createdAt.toISOString(),
      store: mapStore(row),
    };
  });

  const services: PublicListing[] = serviceRows.map((row) => ({
    key: `service:${row.id}`,
    id: row.id,
    type: "service",
    name: row.name,
    description: row.description,
    category: row.category,
    imageUrl: row.imageUrl,
    price: Number(row.price),
    compareAtPrice: null,
    priceUnit: row.pricingUnit,
    durationMinutes: row.durationMinutes,
    stockQuantity: null,
    availability: row.availability ?? "",
    inStock: true,
    bookingRequired: row.bookingRequired,
    deliveryMethod: row.deliveryMethod,
    fulfilmentMethods: row.storeFulfilmentMethods,
    createdAt: row.createdAt.toISOString(),
    store: mapStore(row),
  }));

  return [...products, ...services].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export async function browseMarketplace({
  filters = {},
  page = 1,
  pageSize = 12,
}: {
  filters?: MarketplaceBrowseFilters;
  page?: number;
  pageSize?: number;
}) {
  const allListings = await listPublicListings();
  const categories = Array.from(
    new Set(allListings.map((listing) => listing.category))
  ).sort((a, b) => a.localeCompare(b));

  const q = filters.q?.trim().toLowerCase();
  let listings = allListings.filter((listing) => {
    if (filters.type && listing.type !== filters.type) return false;
    if (filters.category && listing.category !== filters.category) return false;
    if (!q) return true;

    return [
      listing.name,
      listing.description,
      listing.category,
      listing.store.name,
      listing.store.sellerFirstName,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  switch (filters.sort) {
    case "price_asc":
      listings = listings.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      listings = listings.sort((a, b) => b.price - a.price);
      break;
    case "name":
      listings = listings.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      break;
    default:
      break;
  }

  const total = listings.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    listings: listings.slice(start, start + pageSize),
    categories,
    total,
    page: safePage,
    totalPages,
  };
}

async function countStoreListings(storeId: string) {
  const [[products], [services]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.storeId, storeId),
          eq(marketplaceProducts.published, true),
          eq(marketplaceProducts.moderationStatus, "active")
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceServices)
      .where(
        and(
          eq(marketplaceServices.storeId, storeId),
          eq(marketplaceServices.published, true),
          eq(marketplaceServices.moderationStatus, "active")
        )
      ),
  ]);

  const productCount = products?.count ?? 0;
  const serviceCount = services?.count ?? 0;

  return {
    productCount,
    serviceCount,
    listingCount: productCount + serviceCount,
  };
}

export async function getPublicStoreBySlug(
  slug: string
): Promise<PublicStore | null> {
  const [row] = await db
    .select({
      ...storeColumns,
    })
    .from(marketplaceStores)
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(
      and(
        eq(marketplaceStores.slug, slug),
        eq(marketplaceStores.status, "active")
      )
    );

  if (!row) return null;

  const counts = await countStoreListings(row.storeId);
  return { ...mapStore(row), ...counts };
}

export async function getPublicStorefront(slug: string) {
  const store = await getPublicStoreBySlug(slug);
  if (!store) return null;

  const listings = await listPublicListings({ storeId: store.id });
  return { store, listings };
}

export async function listPublicStores(): Promise<PublicStore[]> {
  const [storeRows, productCounts, serviceCounts] = await Promise.all([
    db
      .select({
        ...storeColumns,
      })
      .from(marketplaceStores)
      .innerJoin(students, eq(marketplaceStores.studentId, students.id))
      .where(eq(marketplaceStores.status, "active")),
    db
      .select({
        storeId: marketplaceProducts.storeId,
        count: sql<number>`count(*)::int`,
      })
      .from(marketplaceProducts)
      .innerJoin(
        marketplaceStores,
        eq(marketplaceProducts.storeId, marketplaceStores.id)
      )
      .where(
        and(
          eq(marketplaceStores.status, "active"),
          eq(marketplaceProducts.published, true),
          eq(marketplaceProducts.moderationStatus, "active")
        )
      )
      .groupBy(marketplaceProducts.storeId),
    db
      .select({
        storeId: marketplaceServices.storeId,
        count: sql<number>`count(*)::int`,
      })
      .from(marketplaceServices)
      .innerJoin(
        marketplaceStores,
        eq(marketplaceServices.storeId, marketplaceStores.id)
      )
      .where(
        and(
          eq(marketplaceStores.status, "active"),
          eq(marketplaceServices.published, true),
          eq(marketplaceServices.moderationStatus, "active")
        )
      )
      .groupBy(marketplaceServices.storeId),
  ]);

  const productsByStore = new Map(
    productCounts.map((row) => [row.storeId, row.count])
  );
  const servicesByStore = new Map(
    serviceCounts.map((row) => [row.storeId, row.count])
  );

  return storeRows
    .map((row) => {
      const productCount = productsByStore.get(row.storeId) ?? 0;
      const serviceCount = servicesByStore.get(row.storeId) ?? 0;
      return {
        ...mapStore(row),
        productCount,
        serviceCount,
        listingCount: productCount + serviceCount,
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
}

export async function getPublicListing(
  type: MarketplaceListingType,
  id: string
) {
  const listings = await listPublicListings({ type, id });
  const listing = listings[0] ?? null;
  if (!listing) return null;

  const storeListings = await listPublicListings({
    storeId: listing.store.id,
  });
  const related = storeListings
    .filter((item) => item.key !== listing.key)
    .slice(0, 4);

  return { listing, related };
}
