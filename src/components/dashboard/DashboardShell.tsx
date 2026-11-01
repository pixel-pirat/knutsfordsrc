import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Topbar } from "./Topbar";
import type { PublicStudent } from "@/lib/types";

export function DashboardShell({
  student,
  hasStore,
  children,
}: {
  student: PublicStudent;
  hasStore: boolean;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar student={student} hasStore={hasStore} />
      <SidebarInset>
        <Topbar student={student} />
        <main className="flex-1 bg-neutral-50/50 dark:bg-neutral-950/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
