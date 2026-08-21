import { getCurrentAdmin, listPrograms, getPermitExpiryDate } from "@/db/adminQueries";
import { redirect } from "next/navigation";
import { AdminSettingsTabs } from "./AdminSettingsTabs";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const isSuperAdmin = admin.role === "super_admin";
  const [programs, permitExpiryDate] = await Promise.all([
    isSuperAdmin ? listPrograms() : Promise.resolve([]),
    isSuperAdmin ? getPermitExpiryDate() : Promise.resolve(null),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage your own profile</p>
      </div>

      <AdminSettingsTabs
        profile={{
          name: admin.name,
          email: admin.email,
          avatarUrl: admin.avatarUrl,
          role: admin.role,
        }}
        isSuperAdmin={isSuperAdmin}
        initialPrograms={programs.map((p) => ({ id: p.id, name: p.name, active: p.active }))}
        permitExpiryDate={permitExpiryDate ? permitExpiryDate.toISOString().slice(0, 10) : null}
      />
    </div>
  );
}
