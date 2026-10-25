import { asc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { announcements, settings, type NewAnnouncement } from "./schema";

export const TICKER_SPEED_KEY = "ticker_speed";
export const DEFAULT_TICKER_SPEED = 32;
export const MIN_TICKER_SPEED = 5;
export const MAX_TICKER_SPEED = 120;


export function listAnnouncementsForAdmin() {
  return db
    .select()
    .from(announcements)
    .orderBy(asc(announcements.sortOrder), asc(announcements.createdAt));
}

export function listActiveAnnouncements() {
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.active, true))
    .orderBy(asc(announcements.sortOrder), asc(announcements.createdAt));
}

export function getAnnouncementById(id: string) {
  return db.query.announcements.findFirst({ where: eq(announcements.id, id) });
}

export async function getNextAnnouncementSortOrder() {
  const [row] = await db
    .select({
      max: sql<number>`coalesce(max(${announcements.sortOrder}), -1)::int`,
    })
    .from(announcements);
  return (row?.max ?? -1) + 1;
}

export function createAnnouncement(values: NewAnnouncement) {
  return db.insert(announcements).values(values).returning();
}

export function updateAnnouncement(
  id: string,
  values: Partial<
    Pick<
      NewAnnouncement,
      "text" | "linkUrl" | "active" | "sortOrder" | "startsAt" | "endsAt"
    >
  >
) {
  return db
    .update(announcements)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(announcements.id, id))
    .returning();
}

export function deleteAnnouncement(id: string) {
  return db.delete(announcements).where(eq(announcements.id, id)).returning();
}

/** Persist a new manual order; ids are written in array order. */
export async function reorderAnnouncements(ids: string[]) {
  await Promise.all(
    ids.map((id, index) =>
      db
        .update(announcements)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(announcements.id, id))
    )
  );
}

/** Seconds for one full ticker loop. */
export async function getTickerSpeed() {
  const row = await db.query.settings.findFirst({
    where: eq(settings.key, TICKER_SPEED_KEY),
  });
  const speed = Number(row?.value);
  return Number.isFinite(speed) && speed >= MIN_TICKER_SPEED && speed <= MAX_TICKER_SPEED
    ? speed
    : DEFAULT_TICKER_SPEED;
}

export function setTickerSpeed(seconds: number) {
  return db
    .insert(settings)
    .values({ key: TICKER_SPEED_KEY, value: String(seconds) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: String(seconds), updatedAt: new Date() },
    });
}

export type AnnouncementStatus = "live" | "scheduled" | "expired" | "hidden";

type AnnouncementWindow = {
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export function getAnnouncementStatus(row: AnnouncementWindow): AnnouncementStatus {
  if (!row.active) return "hidden";
  const now = Date.now();
  if (row.startsAt && row.startsAt.getTime() > now) return "scheduled";
  if (row.endsAt && row.endsAt.getTime() <= now) return "expired";
  return "live";
}

/**
 * Everything the homepage ticker needs: whether announcements have been set up
 * at all, plus the ones that are active and inside their schedule window.
 */
export async function getTickerAnnouncements() {
  const rows = await listAnnouncementsForAdmin();
  const now = Date.now();
  return {
    configured: rows.length > 0,
    items: rows.filter(
      (row) =>
        row.active &&
        (!row.startsAt || row.startsAt.getTime() <= now) &&
        (!row.endsAt || row.endsAt.getTime() > now)
    ),
  };
}
