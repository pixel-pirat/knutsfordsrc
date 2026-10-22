import { and, desc, eq, gte, isNull, or, sql } from "drizzle-orm";
import { db } from "./index";
import {
  halls,
  hallEvents,
  hallEventBookings,
  hallMessages,
  students,
  type NewHall,
  type NewHallEvent,
  type NewHallMessage,
} from "./schema";

// ---------------------------------------------------------------------------
// Halls
// ---------------------------------------------------------------------------

/** Lightweight id/name list for selects (student dialogs, comms, etc.) */
export function listHallOptions() {
  return db
    .select({
      id: halls.id,
      name: halls.name,
      active: halls.active,
    })
    .from(halls)
    .orderBy(halls.name);
}

export async function listHallsWithCounts() {
  const rows = await db
    .select({
      id: halls.id,
      name: halls.name,
      wardenName: halls.wardenName,
      location: halls.location,
      capacity: halls.capacity,
      active: halls.active,
      imageUrl: halls.imageUrl,
      createdAt: halls.createdAt,
      memberCount: sql<number>`(
        select count(*)::int from ${students} s where s.hall_id = "halls"."id"
      )`,
      eventCount: sql<number>`(
        select count(*)::int from ${hallEvents} e where e.hall_id = "halls"."id"
      )`,
    })
    .from(halls)
    .orderBy(halls.name);
  return rows;
}

export function getHallById(id: string) {
  return db.query.halls.findFirst({
    where: eq(halls.id, id),
  });
}

export function createHall(values: NewHall) {
  return db.insert(halls).values(values).returning();
}

export function updateHall(
  id: string,
  values: Partial<
    Pick<
      NewHall,
      | "name"
      | "description"
      | "wardenName"
      | "location"
      | "contactEmail"
      | "capacity"
      | "imageUrl"
      | "active"
    >
  >
) {
  return db
    .update(halls)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(halls.id, id))
    .returning();
}

export function deleteHall(id: string) {
  return db.delete(halls).where(eq(halls.id, id)).returning();
}

export function listStudentsInHall(hallId: string) {
  return db
    .select({
      id: students.id,
      indexNumber: students.indexNumber,
      firstName: students.firstName,
      lastName: students.lastName,
      email: students.email,
      phone: students.phone,
      program: students.program,
      level: students.level,
      avatarUrl: students.avatarUrl,
    })
    .from(students)
    .where(eq(students.hallId, hallId))
    .orderBy(students.lastName, students.firstName);
}

export async function countStudentsInHall(hallId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students)
    .where(eq(students.hallId, hallId));
  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Hall events
// ---------------------------------------------------------------------------

export async function listHallEventsForAdmin({ limit = 200, offset = 0 } = {}) {
  return db
    .select({
      id: hallEvents.id,
      title: hallEvents.title,
      hallId: hallEvents.hallId,
      hallName: halls.name,
      location: hallEvents.location,
      startsAt: hallEvents.startsAt,
      endsAt: hallEvents.endsAt,
      capacity: hallEvents.capacity,
      bookingRequired: hallEvents.bookingRequired,
      published: hallEvents.published,
      bookingCount: sql<number>`(
        select count(*)::int from ${hallEventBookings} b
        where b.event_id = ${hallEvents.id} and b.status <> 'cancelled'
      )`,
    })
    .from(hallEvents)
    .leftJoin(halls, eq(hallEvents.hallId, halls.id))
    .orderBy(desc(hallEvents.startsAt))
    .limit(limit)
    .offset(offset);
}

export function getHallEventById(id: string) {
  return db.query.hallEvents.findFirst({
    where: eq(hallEvents.id, id),
  });
}

export function createHallEvent(values: NewHallEvent) {
  return db.insert(hallEvents).values(values).returning();
}

export function updateHallEvent(
  id: string,
  values: Partial<
    Pick<
      NewHallEvent,
      | "hallId"
      | "title"
      | "description"
      | "location"
      | "startsAt"
      | "endsAt"
      | "capacity"
      | "bookingRequired"
      | "imageUrl"
      | "published"
    >
  >
) {
  return db
    .update(hallEvents)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(hallEvents.id, id))
    .returning();
}

export function deleteHallEvent(id: string) {
  return db.delete(hallEvents).where(eq(hallEvents.id, id)).returning();
}

export async function countHallEvents() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hallEvents);
  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Bookings / attendance
// ---------------------------------------------------------------------------

export function listBookingsForEvent(eventId: string) {
  return db
    .select({
      id: hallEventBookings.id,
      studentId: hallEventBookings.studentId,
      status: hallEventBookings.status,
      bookedAt: hallEventBookings.bookedAt,
      indexNumber: students.indexNumber,
      firstName: students.firstName,
      lastName: students.lastName,
      email: students.email,
      phone: students.phone,
    })
    .from(hallEventBookings)
    .innerJoin(students, eq(hallEventBookings.studentId, students.id))
    .where(eq(hallEventBookings.eventId, eventId))
    .orderBy(hallEventBookings.bookedAt);
}

export async function getBookingCount(eventId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hallEventBookings)
    .where(
      and(
        eq(hallEventBookings.eventId, eventId),
        sql`${hallEventBookings.status} <> 'cancelled'`
      )
    );
  return row?.count ?? 0;
}

export function getStudentBooking(eventId: string, studentId: string) {
  return db.query.hallEventBookings.findFirst({
    where: and(
      eq(hallEventBookings.eventId, eventId),
      eq(hallEventBookings.studentId, studentId)
    ),
  });
}

export function createBooking(eventId: string, studentId: string) {
  return db
    .insert(hallEventBookings)
    .values({ eventId, studentId })
    .onConflictDoUpdate({
      target: [hallEventBookings.eventId, hallEventBookings.studentId],
      set: { status: "booked", updatedAt: new Date() },
    })
    .returning();
}

export function updateBookingStatus(
  bookingId: string,
  status: "booked" | "attended" | "cancelled"
) {
  return db
    .update(hallEventBookings)
    .set({ status, updatedAt: new Date() })
    .where(eq(hallEventBookings.id, bookingId))
    .returning();
}

export function cancelBooking(eventId: string, studentId: string) {
  return db
    .update(hallEventBookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(hallEventBookings.eventId, eventId),
        eq(hallEventBookings.studentId, studentId)
      )
    )
    .returning();
}

export async function countBookings() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hallEventBookings)
    .where(sql`${hallEventBookings.status} <> 'cancelled'`);
  return row?.count ?? 0;
}

export async function countAttendedBookings() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hallEventBookings)
    .where(eq(hallEventBookings.status, "attended"));
  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Communications
// ---------------------------------------------------------------------------

export async function listHallMessagesForAdmin({ limit = 100, offset = 0 } = {}) {
  return db
    .select({
      id: hallMessages.id,
      subject: hallMessages.subject,
      body: hallMessages.body,
      hallId: hallMessages.hallId,
      hallName: halls.name,
      recipientCount: hallMessages.recipientCount,
      failedCount: hallMessages.failedCount,
      sentAt: hallMessages.sentAt,
    })
    .from(hallMessages)
    .leftJoin(halls, eq(hallMessages.hallId, halls.id))
    .orderBy(desc(hallMessages.sentAt))
    .limit(limit)
    .offset(offset);
}

export async function countHallMessages() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hallMessages);
  return row?.count ?? 0;
}

export function createHallMessage(values: NewHallMessage) {
  return db.insert(hallMessages).values(values).returning();
}

/**
 * Recipients for a hall broadcast. hallId = null targets every student.
 * Returns everyone regardless of whether they have an email so the UI can
 * show how many will actually receive the message.
 */
export async function listBroadcastRecipients(hallId: string | null) {
  return db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      email: students.email,
    })
    .from(students)
    .where(hallId ? eq(students.hallId, hallId) : sql`true`)
    .orderBy(students.lastName, students.firstName);
}

// ---------------------------------------------------------------------------
// Student-facing queries
// ---------------------------------------------------------------------------

export function getStudentHall(studentHallId: string | null) {
  if (!studentHallId) return Promise.resolve(null);
  return getHallById(studentHallId);
}

export function listHallMessagesForStudent(studentHallId: string | null) {
  return db
    .select({
      id: hallMessages.id,
      subject: hallMessages.subject,
      body: hallMessages.body,
      hallName: halls.name,
      sentAt: hallMessages.sentAt,
    })
    .from(hallMessages)
    .leftJoin(halls, eq(hallMessages.hallId, halls.id))
    .where(
      studentHallId
        ? or(isNull(hallMessages.hallId), eq(hallMessages.hallId, studentHallId))
        : isNull(hallMessages.hallId)
    )
    .orderBy(desc(hallMessages.sentAt))
    .limit(20);
}

export async function listStudentHallEvents(
  studentId: string,
  studentHallId: string | null
) {
  const now = new Date();
  return db
    .select({
      id: hallEvents.id,
      hallId: hallEvents.hallId,
      hallName: halls.name,
      title: hallEvents.title,
      description: hallEvents.description,
      location: hallEvents.location,
      startsAt: hallEvents.startsAt,
      endsAt: hallEvents.endsAt,
      capacity: hallEvents.capacity,
      bookingRequired: hallEvents.bookingRequired,
      imageUrl: hallEvents.imageUrl,
      bookingCount: sql<number>`(
        select count(*)::int from ${hallEventBookings} b
        where b.event_id = ${hallEvents.id} and b.status <> 'cancelled'
      )`,
      myBookingStatus: sql<string | null>`(
        select b.status from ${hallEventBookings} b
        where b.event_id = ${hallEvents.id}
          and b.student_id = ${studentId}
        limit 1
      )`,
    })
    .from(hallEvents)
    .leftJoin(halls, eq(hallEvents.hallId, halls.id))
    .where(
      and(
        eq(hallEvents.published, true),
        gte(hallEvents.startsAt, new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)),
        studentHallId
          ? or(isNull(hallEvents.hallId), eq(hallEvents.hallId, studentHallId))
          : isNull(hallEvents.hallId)
      )
    )
    .orderBy(hallEvents.startsAt)
    .limit(50);
}
