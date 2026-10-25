import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";

export async function getSellerContext() {
  const student = await getCurrentStudent();
  if (!student) return { student: null, store: null };

  const store = await getStoreForStudent(student.id);
  return { student, store };
}

export function canManageStore(status: string) {
  return status === "active" || status === "inactive";
}
