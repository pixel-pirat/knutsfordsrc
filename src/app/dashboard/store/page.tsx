import { getCurrentStudent } from "@/db/queries";
import {
  getApplicationForStudent,
  getStoreForStudent,
  listApplicationEvents,
} from "@/db/marketplaceQueries";
import { StoreClient } from "./StoreClient";

export default async function MyStorePage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const application = await getApplicationForStudent(student.id);
  const store = await getStoreForStudent(student.id);
  const events = application ? await listApplicationEvents(application.id) : [];

  return (
    <StoreClient
      student={{
        firstName: student.firstName,
        lastName: student.lastName,
        indexNumber: student.indexNumber,
        email: student.email,
        phone: student.phone,
        program: student.program,
        level: student.level,
      }}
      application={application ?? null}
      store={store ?? null}
      events={events}
    />
  );
}
