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

export async function getCurrentStudent() {
  const session = await getSession();
  if (!session) return null;
  const student = await getStudentById(session.studentId);
  return student ?? null;
}
