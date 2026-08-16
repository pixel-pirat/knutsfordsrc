import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "./index";
import {
  adminUsers,
  students,
  permits,
  auditLogs,
  programs,
  type NewAdminUser,
  type NewPermit,
} from "./schema";
import { getAdminSession } from "@/lib/adminAuth";

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
    Pick<NewAdminUser, "permissions" | "active" | "name" | "avatarUrl">
  >
) {
  return db
    .update(adminUsers)
    .set({ ...values, updatedAt: new Date() })
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

export function listPermits({ limit = 50, offset = 0 } = {}) {
  return db.query.permits.findMany({
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

export async function countPermits() {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(permits);
  return row?.count ?? 0;
}

export async function countStudents() {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(students);
  return row?.count ?? 0;
}

export function searchStudents(query: string, { limit = 50 } = {}) {
  const like = `%${query}%`;
  return db.query.students.findMany({
    where: or(
      ilike(students.indexNumber, like),
      ilike(students.firstName, like),
      ilike(students.lastName, like),
      ilike(students.email, like),
      ilike(sql`${students.firstName} || ' ' || ${students.lastName}`, like)
    ),
    orderBy: desc(students.createdAt),
    limit,
  });
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
