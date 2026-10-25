import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "./index";
import {
  adminUsers,
  marketplaceApplications,
  marketplaceApplicationEvents,
  marketplaceStores,
  students,
  type MarketplaceApplication,
  type MarketplaceStore,
  type NewMarketplaceApplication,
} from "./schema";

export type ApplicationStatus = MarketplaceApplication["status"];
export type StoreStatus = MarketplaceStore["status"];
export type MarketplaceCategory = MarketplaceApplication["category"];

export type ApplicationFilters = {
  q?: string;
  status?: ApplicationStatus;
  category?: MarketplaceCategory;
};

export type StoreFilters = {
  q?: string;
  status?: StoreStatus;
};

function applicationWhere(filters: ApplicationFilters) {
  const clauses: SQL[] = [];
  if (filters.q) {
    const term = `%${filters.q}%`;
    const match = or(
      ilike(students.firstName, term),
      ilike(students.lastName, term),
      ilike(students.indexNumber, term),
      ilike(marketplaceApplications.storeName, term)
    );
    if (match) clauses.push(match);
  }
  if (filters.status) {
    clauses.push(eq(marketplaceApplications.status, filters.status));
  }
  if (filters.category) {
    clauses.push(eq(marketplaceApplications.category, filters.category));
  }
  return clauses.length > 0 ? and(...clauses) : undefined;
}

function storeWhere(filters: StoreFilters) {
  const clauses: SQL[] = [];
  if (filters.q) {
    const term = `%${filters.q}%`;
    const match = or(
      ilike(students.firstName, term),
      ilike(students.lastName, term),
      ilike(students.indexNumber, term),
      ilike(marketplaceStores.name, term)
    );
    if (match) clauses.push(match);
  }
  if (filters.status) {
    clauses.push(eq(marketplaceStores.status, filters.status));
  }
  return clauses.length > 0 ? and(...clauses) : undefined;
}

// ---------------------------------------------------------------------------
// Student-facing
// ---------------------------------------------------------------------------

export function getApplicationForStudent(studentId: string) {
  return db.query.marketplaceApplications.findFirst({
    where: eq(marketplaceApplications.studentId, studentId),
  });
}

export function getStoreForStudent(studentId: string) {
  return db.query.marketplaceStores.findFirst({
    where: eq(marketplaceStores.studentId, studentId),
  });
}

export function listApplicationEvents(applicationId: string) {
  return db
    .select()
    .from(marketplaceApplicationEvents)
    .where(eq(marketplaceApplicationEvents.applicationId, applicationId))
    .orderBy(asc(marketplaceApplicationEvents.createdAt));
}

export function createApplication(
  studentId: string,
  values: Omit<
    NewMarketplaceApplication,
    "id" | "studentId" | "createdAt" | "updatedAt"
  >
) {
  return db
    .insert(marketplaceApplications)
    .values({ studentId, ...values })
    .returning();
}

export function resubmitApplication(
  applicationId: string,
  values: Partial<
    Pick<
      NewMarketplaceApplication,
      | "contactNumber"
      | "storeName"
      | "category"
      | "description"
      | "offerings"
      | "availability"
      | "fulfilmentMethods"
      | "evidenceUrl"
      | "evidenceNotes"
      | "declarationAccepted"
      | "status"
      | "decisionReason"
    >
  >
) {
  return db
    .update(marketplaceApplications)
    .set({ ...values, submittedAt: new Date(), updatedAt: new Date() })
    .where(eq(marketplaceApplications.id, applicationId))
    .returning();
}

export function addApplicationEvent(values: {
  applicationId: string;
  actorType: "student" | "admin" | "system";
  actorId?: string | null;
  actorName: string;
  status: ApplicationStatus;
  note?: string | null;
}) {
  return db.insert(marketplaceApplicationEvents).values(values).returning();
}

export async function uniqueStoreSlug(name: string, ignoreStoreId?: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "store";

  let slug = base;
  let suffix = 2;
  for (;;) {
    const existing = await db.query.marketplaceStores.findFirst({
      where: eq(marketplaceStores.slug, slug),
    });
    if (!existing || existing.id === ignoreStoreId) return slug;
    slug = `${base}-${suffix++}`;
  }
}

export function createStore(
  studentId: string,
  values: {
    name: string;
    slug: string;
    description?: string | null;
    category: MarketplaceCategory;
    logoUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    fulfilmentMethods: string[];
    operatingHours?: string | null;
    pickupLocation?: string | null;
  }
) {
  return db
    .insert(marketplaceStores)
    .values({ studentId, ...values })
    .returning();
}

export function updateStore(
  id: string,
  values: Partial<
    Pick<
      MarketplaceStore,
      | "name"
      | "slug"
      | "description"
      | "category"
      | "logoUrl"
      | "contactEmail"
      | "contactPhone"
      | "fulfilmentMethods"
      | "operatingHours"
      | "pickupLocation"
    >
  >
) {
  return db
    .update(marketplaceStores)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(marketplaceStores.id, id))
    .returning();
}

// ---------------------------------------------------------------------------
// Admin-facing
// ---------------------------------------------------------------------------

export function listApplicationsForAdmin({
  filters = {},
  limit = 20,
  offset = 0,
}: {
  filters?: ApplicationFilters;
  limit?: number;
  offset?: number;
} = {}) {
  return db
    .select({
      id: marketplaceApplications.id,
      studentId: marketplaceApplications.studentId,
      storeName: marketplaceApplications.storeName,
      category: marketplaceApplications.category,
      availability: marketplaceApplications.availability,
      status: marketplaceApplications.status,
      submittedAt: marketplaceApplications.submittedAt,
      reviewedAt: marketplaceApplications.reviewedAt,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      indexNumber: students.indexNumber,
      avatarUrl: students.avatarUrl,
    })
    .from(marketplaceApplications)
    .innerJoin(students, eq(marketplaceApplications.studentId, students.id))
    .where(applicationWhere(filters))
    .orderBy(desc(marketplaceApplications.submittedAt))
    .limit(limit)
    .offset(offset);
}

export async function countApplicationsForAdmin(filters: ApplicationFilters = {}) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(marketplaceApplications)
    .innerJoin(students, eq(marketplaceApplications.studentId, students.id))
    .where(applicationWhere(filters));
  return row?.count ?? 0;
}

export async function getApplicationDetail(id: string) {
  const [row] = await db
    .select({
      application: marketplaceApplications,
      student: {
        id: students.id,
        indexNumber: students.indexNumber,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        phone: students.phone,
        program: students.program,
        level: students.level,
        avatarUrl: students.avatarUrl,
      },
      reviewerName: adminUsers.name,
    })
    .from(marketplaceApplications)
    .innerJoin(students, eq(marketplaceApplications.studentId, students.id))
    .leftJoin(adminUsers, eq(marketplaceApplications.reviewedBy, adminUsers.id))
    .where(eq(marketplaceApplications.id, id));

  return row ?? null;
}

export async function decideApplication(values: {
  applicationId: string;
  status: ApplicationStatus;
  adminId: string;
  adminName: string;
  decisionReason?: string | null;
  adminNotes?: string | null;
  note?: string | null;
}) {
  const [updated] = await db
    .update(marketplaceApplications)
    .set({
      status: values.status,
      decisionReason: values.decisionReason ?? null,
      adminNotes: values.adminNotes ?? null,
      reviewedBy: values.adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(marketplaceApplications.id, values.applicationId))
    .returning();

  if (updated) {
    await addApplicationEvent({
      applicationId: values.applicationId,
      actorType: "admin",
      actorId: values.adminId,
      actorName: values.adminName,
      status: values.status,
      note: values.note ?? values.decisionReason ?? null,
    });
  }

  return updated;
}

export function listStoresForAdmin({
  filters = {},
  limit = 20,
  offset = 0,
}: {
  filters?: StoreFilters;
  limit?: number;
  offset?: number;
} = {}) {
  return db
    .select({
      id: marketplaceStores.id,
      studentId: marketplaceStores.studentId,
      name: marketplaceStores.name,
      slug: marketplaceStores.slug,
      category: marketplaceStores.category,
      status: marketplaceStores.status,
      statusReason: marketplaceStores.statusReason,
      createdAt: marketplaceStores.createdAt,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      indexNumber: students.indexNumber,
    })
    .from(marketplaceStores)
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(storeWhere(filters))
    .orderBy(desc(marketplaceStores.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countStoresForAdmin(filters: StoreFilters = {}) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(marketplaceStores)
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(storeWhere(filters));
  return row?.count ?? 0;
}

export function listSellersForAdmin({
  q,
  limit = 20,
  offset = 0,
}: {
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const term = q ? `%${q}%` : undefined;
  const search = term
    ? or(
        ilike(students.firstName, term),
        ilike(students.lastName, term),
        ilike(students.indexNumber, term),
        ilike(marketplaceApplications.storeName, term)
      )
    : undefined;

  return db
    .select({
      applicationId: marketplaceApplications.id,
      studentId: students.id,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      indexNumber: students.indexNumber,
      avatarUrl: students.avatarUrl,
      storeName: marketplaceApplications.storeName,
      category: marketplaceApplications.category,
      approvedAt: marketplaceApplications.reviewedAt,
      storeId: marketplaceStores.id,
      storeStatus: marketplaceStores.status,
    })
    .from(marketplaceApplications)
    .innerJoin(students, eq(marketplaceApplications.studentId, students.id))
    .leftJoin(
      marketplaceStores,
      eq(marketplaceStores.studentId, marketplaceApplications.studentId)
    )
    .where(
      search
        ? and(eq(marketplaceApplications.status, "approved"), search)
        : eq(marketplaceApplications.status, "approved")
    )
    .orderBy(desc(marketplaceApplications.reviewedAt))
    .limit(limit)
    .offset(offset);
}

export async function countSellersForAdmin(q?: string) {
  const term = q ? `%${q}%` : undefined;
  const search = term
    ? or(
        ilike(students.firstName, term),
        ilike(students.lastName, term),
        ilike(students.indexNumber, term),
        ilike(marketplaceApplications.storeName, term)
      )
    : undefined;

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(marketplaceApplications)
    .innerJoin(students, eq(marketplaceApplications.studentId, students.id))
    .where(
      search
        ? and(eq(marketplaceApplications.status, "approved"), search)
        : eq(marketplaceApplications.status, "approved")
    );
  return row?.count ?? 0;
}

export async function getStoreDetail(id: string) {  const [row] = await db
    .select({
      store: marketplaceStores,
      student: {
        id: students.id,
        indexNumber: students.indexNumber,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        phone: students.phone,
        program: students.program,
        level: students.level,
        avatarUrl: students.avatarUrl,
      },
    })
    .from(marketplaceStores)
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(eq(marketplaceStores.id, id));

  return row ?? null;
}

export function setStoreStatus(
  id: string,
  status: StoreStatus,
  reason: string | null
) {
  return db
    .update(marketplaceStores)
    .set({ status, statusReason: reason, updatedAt: new Date() })
    .where(eq(marketplaceStores.id, id))
    .returning();
}

export async function getMarketplaceOverview() {
  const pendingStatuses: ApplicationStatus[] = [
    "pending_review",
    "under_review",
    "additional_info_required",
  ];

  const [
    [storeCount],
    [pendingCount],
    [approvedCount],
    [suspendedCount],
    recentApplications,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(marketplaceStores),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceApplications)
      .where(inArray(marketplaceApplications.status, pendingStatuses)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceApplications)
      .where(eq(marketplaceApplications.status, "approved")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(marketplaceStores)
      .where(eq(marketplaceStores.status, "suspended")),
    listApplicationsForAdmin({ limit: 5 }),
  ]);

  return {
    stores: storeCount?.count ?? 0,
    pending: pendingCount?.count ?? 0,
    approved: approvedCount?.count ?? 0,
    suspended: suspendedCount?.count ?? 0,
    recentApplications,
  };
}
