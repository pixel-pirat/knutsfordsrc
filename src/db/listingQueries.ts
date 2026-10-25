import {
  and,
  asc,
  desc,
  eq,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "./index";
import {
  marketplaceProducts,
  marketplaceServices,
  marketplaceStores,
  students,
  type MarketplaceProduct,
  type NewMarketplaceProduct,
  type NewMarketplaceService,
} from "./schema";

export type ListingType = "product" | "service";
export type ListingStatus = MarketplaceProduct["moderationStatus"];

type ListingFilters = {
  q?: string;
  status?: ListingStatus;
};

// ---------------------------------------------------------------------------
// Student / seller
// ---------------------------------------------------------------------------

export function listStoreProducts(storeId: string) {
  return db
    .select()
    .from(marketplaceProducts)
    .where(eq(marketplaceProducts.storeId, storeId))
    .orderBy(desc(marketplaceProducts.createdAt));
}

export function listStoreServices(storeId: string) {
  return db
    .select()
    .from(marketplaceServices)
    .where(eq(marketplaceServices.storeId, storeId))
    .orderBy(desc(marketplaceServices.createdAt));
}

export async function getStoreProduct(storeId: string, id: string) {
  const [row] = await db
    .select()
    .from(marketplaceProducts)
    .where(
      and(
        eq(marketplaceProducts.id, id),
        eq(marketplaceProducts.storeId, storeId)
      )
    );
  return row ?? null;
}

export async function getStoreService(storeId: string, id: string) {
  const [row] = await db
    .select()
    .from(marketplaceServices)
    .where(
      and(
        eq(marketplaceServices.id, id),
        eq(marketplaceServices.storeId, storeId)
      )
    );
  return row ?? null;
}

export function createProduct(
  storeId: string,
  values: Omit<
    NewMarketplaceProduct,
    "id" | "storeId" | "createdAt" | "updatedAt"
  >
) {
  return db
    .insert(marketplaceProducts)
    .values({ storeId, ...values })
    .returning();
}

export function updateProduct(
  id: string,
  values: Partial<
    Pick<
      NewMarketplaceProduct,
      | "name"
      | "description"
      | "category"
      | "imageUrl"
      | "price"
      | "discountPrice"
      | "stockQuantity"
      | "lowStockThreshold"
      | "availability"
      | "fulfilmentMethods"
      | "published"
      | "moderationStatus"
      | "moderationReason"
      | "moderatedBy"
      | "moderatedAt"
    >
  >
) {
  return db
    .update(marketplaceProducts)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(marketplaceProducts.id, id))
    .returning();
}

export function deleteProduct(id: string) {
  return db
    .delete(marketplaceProducts)
    .where(eq(marketplaceProducts.id, id))
    .returning();
}

export function createService(
  storeId: string,
  values: Omit<
    NewMarketplaceService,
    "id" | "storeId" | "createdAt" | "updatedAt"
  >
) {
  return db
    .insert(marketplaceServices)
    .values({ storeId, ...values })
    .returning();
}

export function updateService(
  id: string,
  values: Partial<
    Pick<
      NewMarketplaceService,
      | "name"
      | "description"
      | "category"
      | "imageUrl"
      | "price"
      | "pricingUnit"
      | "durationMinutes"
      | "availability"
      | "bookingRequired"
      | "deliveryMethod"
      | "published"
      | "moderationStatus"
      | "moderationReason"
      | "moderatedBy"
      | "moderatedAt"
    >
  >
) {
  return db
    .update(marketplaceServices)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(marketplaceServices.id, id))
    .returning();
}

export function deleteService(id: string) {
  return db
    .delete(marketplaceServices)
    .where(eq(marketplaceServices.id, id))
    .returning();
}

export async function getSellerListingSummary(storeId: string) {
  const [
    [products],
    [services],
    [activeProducts],
    [activeServices],
    [lowStock],
    [outOfStock],
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.storeId, storeId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceServices)
      .where(eq(marketplaceServices.storeId, storeId)),
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
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.storeId, storeId),
          eq(marketplaceProducts.availability, "ready_stock"),
          lte(
            marketplaceProducts.stockQuantity,
            marketplaceProducts.lowStockThreshold
          )
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.storeId, storeId),
          eq(marketplaceProducts.availability, "ready_stock"),
          eq(marketplaceProducts.stockQuantity, 0)
        )
      ),
  ]);

  return {
    products: products?.count ?? 0,
    services: services?.count ?? 0,
    activeListings: (activeProducts?.count ?? 0) + (activeServices?.count ?? 0),
    lowStock: lowStock?.count ?? 0,
    outOfStock: outOfStock?.count ?? 0,
  };
}

export async function getSellerInventory(storeId: string) {
  return db
    .select()
    .from(marketplaceProducts)
    .where(eq(marketplaceProducts.storeId, storeId))
    .orderBy(
      asc(marketplaceProducts.stockQuantity),
      asc(marketplaceProducts.name)
    );
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

function productWhere(filters: ListingFilters): SQL | undefined {
  const clauses: SQL[] = [];
  if (filters.status) {
    clauses.push(eq(marketplaceProducts.moderationStatus, filters.status));
  }
  if (filters.q) {
    const term = `%${filters.q}%`;
    const match = or(
      ilike(marketplaceProducts.name, term),
      ilike(marketplaceProducts.category, term),
      ilike(marketplaceStores.name, term),
      ilike(students.firstName, term),
      ilike(students.lastName, term),
      ilike(students.indexNumber, term)
    );
    if (match) clauses.push(match);
  }
  return clauses.length > 0 ? and(...clauses) : undefined;
}

function serviceWhere(filters: ListingFilters): SQL | undefined {
  const clauses: SQL[] = [];
  if (filters.status) {
    clauses.push(eq(marketplaceServices.moderationStatus, filters.status));
  }
  if (filters.q) {
    const term = `%${filters.q}%`;
    const match = or(
      ilike(marketplaceServices.name, term),
      ilike(marketplaceServices.category, term),
      ilike(marketplaceStores.name, term),
      ilike(students.firstName, term),
      ilike(students.lastName, term),
      ilike(students.indexNumber, term)
    );
    if (match) clauses.push(match);
  }
  return clauses.length > 0 ? and(...clauses) : undefined;
}

export function listProductsForAdmin({
  filters = {},
  limit = 20,
  offset = 0,
}: {
  filters?: ListingFilters;
  limit?: number;
  offset?: number;
} = {}) {
  return db
    .select({
      id: marketplaceProducts.id,
      name: marketplaceProducts.name,
      category: marketplaceProducts.category,
      imageUrl: marketplaceProducts.imageUrl,
      price: marketplaceProducts.price,
      discountPrice: marketplaceProducts.discountPrice,
      stockQuantity: marketplaceProducts.stockQuantity,
      lowStockThreshold: marketplaceProducts.lowStockThreshold,
      availability: marketplaceProducts.availability,
      published: marketplaceProducts.published,
      moderationStatus: marketplaceProducts.moderationStatus,
      createdAt: marketplaceProducts.createdAt,
      storeId: marketplaceStores.id,
      storeName: marketplaceStores.name,
      storeStatus: marketplaceStores.status,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      indexNumber: students.indexNumber,
    })
    .from(marketplaceProducts)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceProducts.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(productWhere(filters))
    .orderBy(desc(marketplaceProducts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countProductsForAdmin(filters: ListingFilters = {}) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(marketplaceProducts)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceProducts.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(productWhere(filters));
  return row?.count ?? 0;
}

export function listServicesForAdmin({
  filters = {},
  limit = 20,
  offset = 0,
}: {
  filters?: ListingFilters;
  limit?: number;
  offset?: number;
} = {}) {
  return db
    .select({
      id: marketplaceServices.id,
      name: marketplaceServices.name,
      category: marketplaceServices.category,
      imageUrl: marketplaceServices.imageUrl,
      price: marketplaceServices.price,
      pricingUnit: marketplaceServices.pricingUnit,
      durationMinutes: marketplaceServices.durationMinutes,
      deliveryMethod: marketplaceServices.deliveryMethod,
      published: marketplaceServices.published,
      moderationStatus: marketplaceServices.moderationStatus,
      createdAt: marketplaceServices.createdAt,
      storeId: marketplaceStores.id,
      storeName: marketplaceStores.name,
      storeStatus: marketplaceStores.status,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      indexNumber: students.indexNumber,
    })
    .from(marketplaceServices)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceServices.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(serviceWhere(filters))
    .orderBy(desc(marketplaceServices.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countServicesForAdmin(filters: ListingFilters = {}) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(marketplaceServices)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceServices.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(serviceWhere(filters));
  return row?.count ?? 0;
}

export async function getAdminListingCounts() {
  const [
    [productTotal],
    [serviceTotal],
    [productPending],
    [servicePending],
    [productActive],
    [serviceActive],
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceProducts),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceServices),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.moderationStatus, "pending_review")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceServices)
      .where(eq(marketplaceServices.moderationStatus, "pending_review")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceProducts)
      .where(
        and(
          eq(marketplaceProducts.published, true),
          eq(marketplaceProducts.moderationStatus, "active")
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceServices)
      .where(
        and(
          eq(marketplaceServices.published, true),
          eq(marketplaceServices.moderationStatus, "active")
        )
      ),
  ]);

  return {
    productTotal: productTotal?.count ?? 0,
    serviceTotal: serviceTotal?.count ?? 0,
    productPending: productPending?.count ?? 0,
    servicePending: servicePending?.count ?? 0,
    activeListings:
      (productActive?.count ?? 0) + (serviceActive?.count ?? 0),
    pendingListings:
      (productPending?.count ?? 0) + (servicePending?.count ?? 0),
  };
}

export async function getMarketplaceListingStats() {
  const [productActive, serviceActive, productPending, servicePending] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(marketplaceProducts)
        .where(
          and(
            eq(marketplaceProducts.published, true),
            eq(marketplaceProducts.moderationStatus, "active")
          )
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(marketplaceServices)
        .where(
          and(
            eq(marketplaceServices.published, true),
            eq(marketplaceServices.moderationStatus, "active")
          )
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(marketplaceProducts)
        .where(eq(marketplaceProducts.moderationStatus, "pending_review")),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(marketplaceServices)
        .where(eq(marketplaceServices.moderationStatus, "pending_review")),
    ]);

  return {
    activeListings:
      (productActive[0]?.count ?? 0) + (serviceActive[0]?.count ?? 0),
    pendingListings:
      (productPending[0]?.count ?? 0) + (servicePending[0]?.count ?? 0),
  };
}

export async function getListingDetail(type: ListingType, id: string) {
  if (type === "product") {
    const [row] = await db
      .select({
        listing: marketplaceProducts,
        store: {
          id: marketplaceStores.id,
          name: marketplaceStores.name,
          slug: marketplaceStores.slug,
          status: marketplaceStores.status,
          logoUrl: marketplaceStores.logoUrl,
        },
        student: {
          id: students.id,
          indexNumber: students.indexNumber,
          firstName: students.firstName,
          lastName: students.lastName,
          avatarUrl: students.avatarUrl,
          email: students.email,
          phone: students.phone,
          program: students.program,
          level: students.level,
        },
      })
      .from(marketplaceProducts)
      .innerJoin(
        marketplaceStores,
        eq(marketplaceProducts.storeId, marketplaceStores.id)
      )
      .innerJoin(students, eq(marketplaceStores.studentId, students.id))
      .where(eq(marketplaceProducts.id, id));
    return row ? { type: "product" as const, ...row } : null;
  }

  const [row] = await db
    .select({
      listing: marketplaceServices,
      store: {
        id: marketplaceStores.id,
        name: marketplaceStores.name,
        slug: marketplaceStores.slug,
        status: marketplaceStores.status,
        logoUrl: marketplaceStores.logoUrl,
      },
      student: {
        id: students.id,
        indexNumber: students.indexNumber,
        firstName: students.firstName,
        lastName: students.lastName,
        avatarUrl: students.avatarUrl,
        email: students.email,
        phone: students.phone,
        program: students.program,
        level: students.level,
      },
    })
    .from(marketplaceServices)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceServices.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(eq(marketplaceServices.id, id));
  return row ? { type: "service" as const, ...row } : null;
}

export function moderateProduct(
  id: string,
  values: {
    status: ListingStatus;
    reason: string | null;
    adminId: string;
  }
) {
  return db
    .update(marketplaceProducts)
    .set({
      moderationStatus: values.status,
      moderationReason: values.reason,
      moderatedBy: values.adminId,
      moderatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(marketplaceProducts.id, id))
    .returning();
}

export function moderateService(
  id: string,
  values: {
    status: ListingStatus;
    reason: string | null;
    adminId: string;
  }
) {
  return db
    .update(marketplaceServices)
    .set({
      moderationStatus: values.status,
      moderationReason: values.reason,
      moderatedBy: values.adminId,
      moderatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(marketplaceServices.id, id))
    .returning();
}
