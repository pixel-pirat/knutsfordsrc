import { and, desc, eq, gte, or, isNull } from "drizzle-orm";
import { db } from "./index";
import {
  students,
  events,
  newsPosts,
  executiveYearGroups,
  executiveProfiles,
  executiveAchievements,
  type NewStudent,
} from "./schema";
import { getSession } from "@/lib/auth";

export function getStudentByIndexNumber(indexNumber: string) {
  return db.query.students.findFirst({
    where: eq(students.indexNumber, indexNumber),
  });
}

export function getStudentById(id: string) {
  return db.query.students.findFirst({
    where: eq(students.id, id),
  });
}

export function createStudent(values: NewStudent) {
  return db.insert(students).values(values).returning();
}

export function updateStudentProfile(
  id: string,
  values: Partial<
    Pick<NewStudent, "email" | "phone" | "program" | "level" | "studyMode">
  >
) {
  return db
    .update(students)
    .set({ ...values, profileCompleted: true, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning();
}

export function updateStudentPassword(id: string, passwordHash: string) {
  return db
    .update(students)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning();
}

export function updateStudentAvatar(id: string, avatarUrl: string) {
  return db
    .update(students)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning();
}

export function updateStudentByAdmin(
  id: string,
  values: Partial<
    Pick<
      NewStudent,
      | "indexNumber"
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "program"
      | "level"
      | "studyMode"
      | "avatarUrl"
    >
  >
) {
  return db
    .update(students)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(students.id, id))
    .returning();
}

export function getStudentWithPermits(id: string) {
  return db.query.students.findFirst({
    where: eq(students.id, id),
    with: {
      permits: {
        orderBy: (permits, { desc }) => desc(permits.issuedAt),
        with: {
          issuer: { columns: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getCurrentStudent() {
  const session = await getSession();
  if (!session) return null;
  const student = await getStudentById(session.studentId);
  return student ?? null;
}

export function listUpcomingEvents({ limit = 50 } = {}) {
  const now = new Date();
  return db.query.events.findMany({
    where: and(
      eq(events.published, true),
      or(
        gte(events.endsAt, now),
        and(isNull(events.endsAt), gte(events.startsAt, now))
      )
    ),
    orderBy: (events, { asc }) => asc(events.startsAt),
    limit,
  });
}

export function listPublishedNews({ limit = 30 } = {}) {
  return db.query.newsPosts.findMany({
    where: eq(newsPosts.published, true),
    orderBy: desc(newsPosts.publishedAt),
    limit,
  });
}

// ---------- Executives (public) ----------

export function listYearGroupsPublic() {
  return db.query.executiveYearGroups.findMany({
    where: eq(executiveYearGroups.active, true),
    orderBy: desc(executiveYearGroups.createdAt),
  });
}

export function getYearGroupPublic(id: string) {
  return db.query.executiveYearGroups.findFirst({
    where: and(eq(executiveYearGroups.id, id), eq(executiveYearGroups.active, true)),
  });
}

export function listProfilesForYearGroupPublic(yearGroupId: string) {
  return db.query.executiveProfiles.findMany({
    where: eq(executiveProfiles.yearGroupId, yearGroupId),
    orderBy: (executiveProfiles, { asc }) => asc(executiveProfiles.displayOrder),
    columns: {
      id: true,
      name: true,
      position: true,
      bio: true,
      avatarUrl: true,
      socialLinks: true,
    },
  });
}

export function getProfilePublic(id: string) {
  return db.query.executiveProfiles.findFirst({
    where: eq(executiveProfiles.id, id),
    columns: {
      id: true,
      name: true,
      position: true,
      bio: true,
      avatarUrl: true,
      socialLinks: true,
    },
    with: {
      yearGroup: { columns: { id: true, label: true, active: true } },
      achievements: {
        orderBy: desc(executiveAchievements.achievedAt),
        columns: { id: true, title: true, description: true, achievedAt: true, imageUrl: true },
      },
    },
  });
}

export function listAchievementsPublic({
  yearGroupId,
  limit = 50,
}: { yearGroupId?: string; limit?: number } = {}) {
  return db.query.executiveAchievements.findMany({
    where: yearGroupId ? eq(executiveAchievements.yearGroupId, yearGroupId) : undefined,
    orderBy: desc(executiveAchievements.achievedAt),
    limit,
    columns: {
      id: true,
      title: true,
      description: true,
      achievedAt: true,
      imageUrl: true,
    },
    with: {
      yearGroup: { columns: { id: true, label: true } },
      profile: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export function getStudentPublicSnapshot(id: string) {
  return db.query.students.findFirst({
    where: eq(students.id, id),
    columns: {
      id: true,
      indexNumber: true,
      firstName: true,
      lastName: true,
      program: true,
      level: true,
      avatarUrl: true,
    },
    with: {
      permits: {
        orderBy: (permits, { desc }) => desc(permits.issuedAt),
        limit: 1,
        columns: { cardStatus: true, expiresAt: true },
      },
    },
  });
}
