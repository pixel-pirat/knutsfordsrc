import { asc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { announcements, type NewAnnouncement } from "./schema";

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
  values: Partial<Pick<NewAnnouncement, "text" | "linkUrl" | "active" | "sortOrder">>
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
