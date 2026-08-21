"use client";

import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white dark:bg-neutral-900">
      <aside className="hidden w-64 shrink-0 border-r border-black/5 dark:border-white/10 lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar admin={admin} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-neutral-50 dark:bg-neutral-900 shadow-xl">
            <AdminSidebar admin={admin} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar admin={admin} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 bg-neutral-50/50 dark:bg-neutral-950/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
