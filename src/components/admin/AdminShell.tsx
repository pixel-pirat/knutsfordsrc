import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import type { PublicAdmin } from "@/lib/types";

export function AdminShell({
  admin,
  children,
}: {
  admin: PublicAdmin;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar admin={admin} />
      <SidebarInset>
        <AdminTopbar admin={admin} />
        <div className="flex-1 bg-neutral-50/50 dark:bg-neutral-950/50 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
