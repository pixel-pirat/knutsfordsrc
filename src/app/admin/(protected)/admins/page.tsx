import { getCurrentAdmin, listAdmins } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { AdminsManager } from "./AdminsManager";

export default async function AdminsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  const admins = await listAdmins();

  return (
    <AdminsManager
      initialAdmins={admins.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: a.role,
        permissions: a.permissions,
        active: a.active,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}
