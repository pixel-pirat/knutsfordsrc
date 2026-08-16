import { eq } from "drizzle-orm";
import { db } from "./index";
import { students, type NewStudent } from "./schema";
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
