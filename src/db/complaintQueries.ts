import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "./index";
import {
  adminUsers,
  marketplaceComplaintEvents,
  marketplaceComplaints,
  marketplaceOrders,
  marketplaceStores,
  students,
} from "./schema";
import type {
  AdminComplaintDetail,
  AdminComplaintSummary,
  BuyerComplaintDetail,
  BuyerComplaintSummary,
  MarketplaceComplaintEvent,
  SellerComplaintDetail,
  SellerComplaintSummary,
} from "@/lib/marketplace";
import type {
  MarketplaceComplaintCategory,
  MarketplaceComplaintStatus,
} from "@/lib/complaintWorkflow";

export function complaintReferenceNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `CMP-${date}-${suffix}`;
}

export type ComplaintFilters = {
  q?: string;
  status?: string;
  category?: string;
};

const complaintColumns = {
  id: marketplaceComplaints.id,
  referenceNumber: marketplaceComplaints.referenceNumber,
  orderId: marketplaceComplaints.orderId,
  orderNumber: marketplaceOrders.orderNumber,
  storeId: marketplaceComplaints.storeId,
  storeName: marketplaceStores.name,
  complainantStudentId: marketplaceComplaints.complainantStudentId,
  complainantName: marketplaceComplaints.complainantName,
  complainantPhone: marketplaceComplaints.complainantPhone,
  complainantEmail: marketplaceComplaints.complainantEmail,
  category: marketplaceComplaints.category,
  subject: marketplaceComplaints.subject,
  description: marketplaceComplaints.description,
  evidence: marketplaceComplaints.evidence,
  status: marketplaceComplaints.status,
  assignedAdminId: marketplaceComplaints.assignedAdminId,
  resolutionNotes: marketplaceComplaints.resolutionNotes,
  resolvedAt: marketplaceComplaints.resolvedAt,
  createdAt: marketplaceComplaints.createdAt,
  updatedAt: marketplaceComplaints.updatedAt,
};

type ComplaintRow = {
  id: string;
  referenceNumber: string;
  orderId: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  complainantStudentId: string;
  complainantName: string;
  complainantPhone: string;
  complainantEmail: string | null;
  category: string;
  subject: string;
  description: string;
  evidence: string | null;
  status: string;
  assignedAdminId: string | null;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function summary(row: ComplaintRow): BuyerComplaintSummary {
  return {
    id: row.id,
    referenceNumber: row.referenceNumber,
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    storeId: row.storeId,
    storeName: row.storeName,
    category: row.category,
    subject: row.subject,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

async function withEvents(rows: ComplaintRow[]): Promise<BuyerComplaintDetail[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const eventRows = await db
    .select()
    .from(marketplaceComplaintEvents)
    .where(inArray(marketplaceComplaintEvents.complaintId, ids))
    .orderBy(asc(marketplaceComplaintEvents.createdAt));

  const eventsByComplaint = new Map<string, MarketplaceComplaintEvent[]>();
  for (const row of eventRows) {
    const events = eventsByComplaint.get(row.complaintId) ?? [];
    events.push({
      id: row.id,
      actorType: row.actorType,
      actorName: row.actorName,
      eventType: row.eventType,
      status: row.status,
      note: row.note,
      createdAt: row.createdAt.toISOString(),
    });
    eventsByComplaint.set(row.complaintId, events);
  }

  return rows.map((row) => ({
    ...summary(row),
    description: row.description,
    evidence: row.evidence,
    complainantName: row.complainantName,
    complainantPhone: row.complainantPhone,
    complainantEmail: row.complainantEmail,
    resolutionNotes: row.resolutionNotes,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    events: eventsByComplaint.get(row.id) ?? [],
  }));
}

export async function createComplaint({
  orderId,
  storeId,
  complainant,
  category,
  subject,
  description,
  evidence,
}: {
  orderId: string;
  storeId: string;
  complainant: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  };
  category: MarketplaceComplaintCategory;
  subject: string;
  description: string;
  evidence?: string | null;
}) {
  const referenceNumber = complaintReferenceNumber();

  const [created] = await db
    .insert(marketplaceComplaints)
    .values({
      referenceNumber,
      orderId,
      storeId,
      complainantStudentId: complainant.id,
      complainantName: complainant.name,
      complainantPhone: complainant.phone,
      complainantEmail: complainant.email ?? null,
      category,
      subject,
      description,
      evidence: evidence?.trim() || null,
    })
    .returning();

  await db.insert(marketplaceComplaintEvents).values({
    complaintId: created.id,
    actorType: "buyer",
    actorId: complainant.id,
    actorName: complainant.name,
    eventType: "filed",
    status: "open",
    note: null,
  });

  return created;
}

export async function hasOpenComplaintForOrder(
  orderId: string,
  studentId: string
) {
  const rows = await db
    .select({ id: marketplaceComplaints.id })
    .from(marketplaceComplaints)
    .where(
      and(
        eq(marketplaceComplaints.orderId, orderId),
        eq(marketplaceComplaints.complainantStudentId, studentId),
        inArray(marketplaceComplaints.status, [
          "open",
          "awaiting_seller_response",
          "under_investigation",
          "escalated",
        ])
      )
    );
  return rows.length > 0;
}

export async function getBuyerComplaints(
  studentId: string
): Promise<BuyerComplaintSummary[]> {
  const rows = await db
    .select(complaintColumns)
    .from(marketplaceComplaints)
    .innerJoin(
      marketplaceOrders,
      eq(marketplaceComplaints.orderId, marketplaceOrders.id)
    )
    .innerJoin(
      marketplaceStores,
      eq(marketplaceComplaints.storeId, marketplaceStores.id)
    )
    .where(eq(marketplaceComplaints.complainantStudentId, studentId))
    .orderBy(desc(marketplaceComplaints.createdAt));
  return rows.map(summary);
}

export async function getBuyerComplaintByReference(
  studentId: string,
  reference: string
): Promise<BuyerComplaintDetail | null> {
  const [row] = await db
    .select(complaintColumns)
    .from(marketplaceComplaints)
    .innerJoin(
      marketplaceOrders,
      eq(marketplaceComplaints.orderId, marketplaceOrders.id)
    )
    .innerJoin(
      marketplaceStores,
      eq(marketplaceComplaints.storeId, marketplaceStores.id)
    )
    .where(
      and(
        eq(marketplaceComplaints.complainantStudentId, studentId),
        eq(marketplaceComplaints.referenceNumber, reference)
      )
    );
  if (!row) return null;
  const [detail] = await withEvents([row]);
  return detail ?? null;
}

export async function getSellerComplaints(
  storeId: string
): Promise<SellerComplaintSummary[]> {
  const rows = await db
    .select(complaintColumns)
    .from(marketplaceComplaints)
    .innerJoin(
      marketplaceOrders,
      eq(marketplaceComplaints.orderId, marketplaceOrders.id)
    )
    .innerJoin(
      marketplaceStores,
      eq(marketplaceComplaints.storeId, marketplaceStores.id)
    )
    .where(eq(marketplaceComplaints.storeId, storeId))
    .orderBy(desc(marketplaceComplaints.createdAt));
  return rows.map((row) => ({ ...summary(row), complainantName: row.complainantName }));
}

export async function getSellerComplaintByReference(
  storeId: string,
  reference: string
): Promise<SellerComplaintDetail | null> {
  const [row] = await db
    .select(complaintColumns)
    .from(marketplaceComplaints)
    .innerJoin(
      marketplaceOrders,
      eq(marketplaceComplaints.orderId, marketplaceOrders.id)
    )
    .innerJoin(
      marketplaceStores,
      eq(marketplaceComplaints.storeId, marketplaceStores.id)
    )
    .where(
      and(
        eq(marketplaceComplaints.storeId, storeId),
        eq(marketplaceComplaints.referenceNumber, reference)
      )
    );
  if (!row) return null;
  const [detail] = await withEvents([row]);
  return detail ?? null;
}

// ---------------------------------------------------------------------------
// Admin complaint oversight
// ---------------------------------------------------------------------------

const adminComplaintColumns = {
  ...complaintColumns,
  sellerName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
  sellerIndexNumber: students.indexNumber,
  assignedAdminName: adminUsers.name,
};

type AdminComplaintRow = ComplaintRow & {
  sellerName: string;
  sellerIndexNumber: string;
  assignedAdminName: string | null;
};

function adminComplaintWhere(filters: ComplaintFilters): SQL | undefined {
  const clauses: SQL[] = [];

  if (filters.q) {
    const term = `%${filters.q}%`;
    const match = or(
      ilike(marketplaceComplaints.referenceNumber, term),
      ilike(marketplaceComplaints.subject, term),
      ilike(marketplaceComplaints.complainantName, term),
      ilike(marketplaceStores.name, term),
      ilike(students.firstName, term),
      ilike(students.lastName, term),
      ilike(students.indexNumber, term)
    );
    if (match) clauses.push(match);
  }
  if (filters.status) {
    clauses.push(
      eq(
        marketplaceComplaints.status,
        filters.status as MarketplaceComplaintStatus
      )
    );
  }
  if (filters.category) {
    clauses.push(
      eq(
        marketplaceComplaints.category,
        filters.category as MarketplaceComplaintCategory
      )
    );
  }

  return clauses.length > 0 ? and(...clauses) : undefined;
}

function adminSummary(row: AdminComplaintRow): AdminComplaintSummary {
  return {
    ...summary(row),
    complainantName: row.complainantName,
    sellerName: row.sellerName,
    sellerIndexNumber: row.sellerIndexNumber,
    assignedAdminId: row.assignedAdminId,
    assignedAdminName: row.assignedAdminName,
  };
}

export async function getAdminComplaints({
  filters,
  limit = 20,
  offset = 0,
}: {
  filters: ComplaintFilters;
  limit?: number;
  offset?: number;
}): Promise<AdminComplaintSummary[]> {
  const rows = await db
    .select(adminComplaintColumns)
    .from(marketplaceComplaints)
    .innerJoin(
      marketplaceOrders,
      eq(marketplaceComplaints.orderId, marketplaceOrders.id)
    )
    .innerJoin(
      marketplaceStores,
      eq(marketplaceComplaints.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .leftJoin(adminUsers, eq(marketplaceComplaints.assignedAdminId, adminUsers.id))
    .where(adminComplaintWhere(filters))
    .orderBy(desc(marketplaceComplaints.createdAt))
    .limit(limit)
    .offset(offset);
  return rows.map(adminSummary);
}

export async function countAdminComplaints(filters: ComplaintFilters) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(marketplaceComplaints)
    .innerJoin(
      marketplaceOrders,
      eq(marketplaceComplaints.orderId, marketplaceOrders.id)
    )
    .innerJoin(
      marketplaceStores,
      eq(marketplaceComplaints.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(adminComplaintWhere(filters));
  return row?.count ?? 0;
}

export async function getAdminComplaintByReference(
  reference: string
): Promise<AdminComplaintDetail | null> {
  const [row] = await db
    .select(adminComplaintColumns)
    .from(marketplaceComplaints)
    .innerJoin(
      marketplaceOrders,
      eq(marketplaceComplaints.orderId, marketplaceOrders.id)
    )
    .innerJoin(
      marketplaceStores,
      eq(marketplaceComplaints.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .leftJoin(adminUsers, eq(marketplaceComplaints.assignedAdminId, adminUsers.id))
    .where(eq(marketplaceComplaints.referenceNumber, reference));

  if (!row) return null;
  const [detail] = await withEvents([row]);
  if (!detail) return null;

  return {
    ...detail,
    sellerName: row.sellerName,
    sellerIndexNumber: row.sellerIndexNumber,
    assignedAdminId: row.assignedAdminId,
    assignedAdminName: row.assignedAdminName,
  };
}
