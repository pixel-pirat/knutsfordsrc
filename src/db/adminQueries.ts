import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "./index";
import {
  adminUsers,
  students,
  permits,
  auditLogs,
  programs,
  settings,
  type NewAdminUser,
  type NewPermit,
} from "./schema";

import { getAdminSession } from "@/lib/adminAuth";

export const PERMIT_EXPIRY_DATE_KEY = "permit_expiry_date";

export async function getSetting(key: string) {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  return db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })
    .returning();
}

export async function getPermitExpiryDate() {
  const value = await getSetting(PERMIT_EXPIRY_DATE_KEY);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function bulkApplyPermitExpiry(date: Date) {
  return db
    .update(permits)
    .set({ expiresAt: date })
    .where(sql`${permits.expiresAt} IS NULL OR ${permits.expiresAt} > now()`)
    .returning({ id: permits.id });
}

export function getAdminByEmail(email: string) {
  return db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email),
  });
}

export function getAdminById(id: string) {
  return db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, id),
  });
}

export async function countAdmins() {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(adminUsers);
  return row?.count ?? 0;
}

export function createAdmin(values: NewAdminUser) {
  return db.insert(adminUsers).values(values).returning();
}

export function listAdmins() {
  return db.query.adminUsers.findMany({
    orderBy: desc(adminUsers.createdAt),
  });
}

export function updateAdmin(
  id: string,
  values: Partial<
    Pick<NewAdminUser, "permissions" | "active" | "name" | "email" | "avatarUrl">
  >
) {
  return db
    .update(adminUsers)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(adminUsers.id, id))
    .returning();
}

export function updateAdminPassword(id: string, passwordHash: string) {
  return db
    .update(adminUsers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(adminUsers.id, id))
    .returning();
}

export async function getCurrentAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  const admin = await getAdminById(session.adminId);
  if (!admin || !admin.active) return null;
  return admin;
}

export function logAudit(entry: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return db.insert(auditLogs).values({
    actorId: entry.actorId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId ?? null,
    metadata: entry.metadata ?? null,
  });
}

export function listAuditLogs({ limit = 50, offset = 0 } = {}) {
  return db.query.auditLogs.findMany({
    orderBy: desc(auditLogs.createdAt),
    limit,
    offset,
    with: {
      actor: { columns: { id: true, name: true, email: true } },
    },
  });
}

export async function countAuditLogs() {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(auditLogs);
  return row?.count ?? 0;
}

export function generatePermitReference() {
  const year = new Date().getFullYear();
  const suffix = Date.now().toString(36).toUpperCase();
  return `PMT-${year}-${suffix}`;
}

export function createPermit(values: NewPermit) {
  return db.insert(permits).values(values).returning();
}

export type PermitStatusFilter = "active" | "pending" | "expired";

function buildPermitConditions({
  query,
  status,
}: {
  query?: string;
  status?: PermitStatusFilter;
} = {}) {
  const conditions = [];

  if (query) {
    const like = `%${query}%`;
    const matchingStudentIds = db
      .select({ id: students.id })
      .from(students)
      .where(
        or(
          ilike(students.indexNumber, like),
          ilike(students.firstName, like),
          ilike(students.lastName, like),
          ilike(sql`${students.firstName} || ' ' || ${students.lastName}`, like)
        )
      );
    conditions.push(
      or(ilike(permits.referenceNumber, like), inArray(permits.studentId, matchingStudentIds))
    );
  }

  if (status === "expired") {
    conditions.push(sql`${permits.expiresAt} IS NOT NULL AND ${permits.expiresAt} <= now()`);
  } else if (status === "active") {
    conditions.push(
      sql`${permits.cardStatus} = 'active' AND (${permits.expiresAt} IS NULL OR ${permits.expiresAt} > now())`
    );
  } else if (status === "pending") {
    conditions.push(
      sql`${permits.cardStatus} = 'pending' AND (${permits.expiresAt} IS NULL OR ${permits.expiresAt} > now())`
    );
  }

  return conditions;
}

export function listPermits({
  limit = 50,
  offset = 0,
  query,
  status,
}: {
  limit?: number;
  offset?: number;
  query?: string;
  status?: PermitStatusFilter;
} = {}) {
  const conditions = buildPermitConditions({ query, status });
  return db.query.permits.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: desc(permits.issuedAt),
    limit,
    offset,
    with: {
      student: {
        columns: { id: true, indexNumber: true, firstName: true, lastName: true },
      },
      issuer: { columns: { id: true, name: true } },
    },
  });
}

export async function countPermits({
  query,
  status,
}: {
  query?: string;
  status?: PermitStatusFilter;
} = {}) {
  const conditions = buildPermitConditions({ query, status });
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(permits)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  return row?.count ?? 0;
}

export async function countStudents() {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(students);
  return row?.count ?? 0;
}

function studentSearchCondition(query: string) {
  const like = `%${query}%`;
  return or(
    ilike(students.indexNumber, like),
    ilike(students.firstName, like),
    ilike(students.lastName, like),
    ilike(students.email, like),
    ilike(sql`${students.firstName} || ' ' || ${students.lastName}`, like)
  );
}

export function searchStudents(query: string, { limit = 50, offset = 0 } = {}) {
  return db.query.students.findMany({
    where: studentSearchCondition(query),
    orderBy: desc(students.createdAt),
    limit,
    offset,
  });
}

export async function countSearchStudents(query: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students)
    .where(studentSearchCondition(query));
  return row?.count ?? 0;
}

export async function permitsIssuedLast14Days() {
  const rows = await db.execute<{ day: string; count: number; revenue: string }>(sql`
    SELECT
      to_char(d.day, 'DD Mon') AS day,
      COUNT(p.id)::int AS count,
      COALESCE(SUM(p.amount), 0)::text AS revenue
    FROM generate_series(current_date - interval '13 days', current_date, interval '1 day') AS d(day)
    LEFT JOIN ${permits} p ON date_trunc('day', p.issued_at) = d.day
    GROUP BY d.day
    ORDER BY d.day
  `);
  return rows.rows as { day: string; count: number; revenue: string }[];
}

export async function countPermitsThisMonth() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(permits)
    .where(sql`date_trunc('month', ${permits.issuedAt}) = date_trunc('month', now())`);
  return row?.count ?? 0;
}

export async function totalRevenue() {
  const [row] = await db
    .select({ total: sql<string>`COALESCE(SUM(${permits.amount}), 0)::text` })
    .from(permits);
  return row?.total ?? "0";
}

export async function getPermitStatusBreakdown() {
  const notExpired = sql`(${permits.expiresAt} IS NULL OR ${permits.expiresAt} > now())`;
  const expired = sql`(${permits.expiresAt} IS NOT NULL AND ${permits.expiresAt} <= now())`;
  const [row] = await db
    .select({
      active: sql<number>`count(*) FILTER (WHERE ${notExpired} AND ${permits.cardStatus} = 'active')::int`,
      pending: sql<number>`count(*) FILTER (WHERE ${notExpired} AND ${permits.cardStatus} = 'pending')::int`,
      expired: sql<number>`count(*) FILTER (WHERE ${expired})::int`,
    })
    .from(permits);
  return row ?? { active: 0, pending: 0, expired: 0 };
}

export async function getPaymentMethodBreakdown() {
  const rows = await db
    .select({
      method: sql<string>`COALESCE(${permits.paymentMethod}, 'Unspecified')`,
      count: sql<number>`count(*)::int`,
      revenue: sql<string>`COALESCE(SUM(${permits.amount}), 0)::text`,
    })
    .from(permits)
    .groupBy(sql`COALESCE(${permits.paymentMethod}, 'Unspecified')`)
    .orderBy(desc(sql`count(*)`));
  return rows;
}

export async function getPermitsByIssuer() {
  const rows = await db
    .select({
      issuerId: adminUsers.id,
      issuerName: adminUsers.name,
      count: sql<number>`count(${permits.id})::int`,
      revenue: sql<string>`COALESCE(SUM(${permits.amount}), 0)::text`,
    })
    .from(permits)
    .innerJoin(adminUsers, eq(permits.issuedBy, adminUsers.id))
    .groupBy(adminUsers.id, adminUsers.name)
    .orderBy(desc(sql`count(${permits.id})`));
  return rows;
}

export function listStudents({ limit = 50, offset = 0 } = {}) {
  return db.query.students.findMany({
    orderBy: desc(students.createdAt),
    limit,
    offset,
  });
}

export function getPermitById(id: string) {
  return db.query.permits.findFirst({
    where: eq(permits.id, id),
    with: {
      student: true,
      issuer: { columns: { id: true, name: true } },
    },
  });
}

export function updatePermitCardStatus(id: string, cardStatus: "pending" | "active") {
  return db
    .update(permits)
    .set({ cardStatus })
    .where(eq(permits.id, id))
    .returning();
}

export function deletePermit(id: string) {
  return db.delete(permits).where(eq(permits.id, id)).returning();
}

export async function deleteStudentCascade(id: string) {
  await db.delete(permits).where(eq(permits.studentId, id));
  return db.delete(students).where(eq(students.id, id)).returning();
}

export function markPermitEmailSent(id: string) {
  return db
    .update(permits)
    .set({ emailSentAt: new Date() })
    .where(eq(permits.id, id))
    .returning();
}

export function listPrograms() {
  return db.query.programs.findMany({
    orderBy: (programs, { asc }) => asc(programs.name),
  });
}

export function listActivePrograms() {
  return db.query.programs.findMany({
    where: eq(programs.active, true),
    orderBy: (programs, { asc }) => asc(programs.name),
  });
}

export function createProgram(name: string) {
  return db.insert(programs).values({ name }).returning();
}

export function deleteProgram(id: string) {
  return db.delete(programs).where(eq(programs.id, id)).returning();
}
