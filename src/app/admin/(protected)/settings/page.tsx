import { getCurrentAdmin } from "@/db/adminQueries";
import { redirect } from "next/navigation";
import { AdminSettingsForm } from "./AdminSettingsForm";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your own profile</p>
      </div>

      <div className="max-w-lg rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <AdminSettingsForm
          initial={{
            name: admin.name,
            email: admin.email,
            avatarUrl: admin.avatarUrl,
            role: admin.role,
          }}
        />
      </div>
    </div>
  );
}
