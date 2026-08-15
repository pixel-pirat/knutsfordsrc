"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/data/admin";
import { hasPermission } from "@/lib/permissions";
import { HubIcon } from "@/components/icons";
import type { PublicAdmin } from "@/lib/types";

export function AdminSidebar({
  admin,
  onNavigate,
}: {
  admin: PublicAdmin;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visibleNav = adminNav.filter((item) => {
    if (item.superAdminOnly) return admin.role === "super_admin";
    if (item.permission) return hasPermission(admin, item.permission);
    return true;
  });

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Image
          src="/logo.png"
          alt="Knutsford University crest"
          width={440}
          height={398}
          className="h-9 w-auto"
        />
        <div>
          <p className="text-sm font-bold leading-tight text-ink">
            Knutsford SRC
          </p>
          <p className="text-xs leading-tight text-neutral-500">
            Staff Portal
          </p>
        </div>
      </div>

      <p className="px-6 pb-2 text-xs font-semibold tracking-wide text-neutral-400">
        ADMIN
      </p>

      <nav className="flex-1 space-y-1 px-3 pb-6">
        {visibleNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-ink text-white"
                  : "text-neutral-600 hover:bg-black/5 hover:text-ink"
              }`}
            >
              <HubIcon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
