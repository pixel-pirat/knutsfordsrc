import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/db/adminQueries";
import { AdminShell } from "@/components/admin/AdminShell";
import type { PublicAdmin } from "@/lib/types";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const publicAdmin: PublicAdmin = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
    avatarUrl: admin.avatarUrl,
  };

  return <AdminShell admin={publicAdmin}>{children}</AdminShell>;
}
