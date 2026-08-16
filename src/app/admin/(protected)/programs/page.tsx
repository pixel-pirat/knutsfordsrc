import { getCurrentAdmin, listPrograms } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { ProgramsManager } from "./ProgramsManager";

export default async function ProgramsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  const programs = await listPrograms();

  return (
    <ProgramsManager
      initialPrograms={programs.map((p) => ({
        id: p.id,
        name: p.name,
        active: p.active,
      }))}
    />
  );
}
