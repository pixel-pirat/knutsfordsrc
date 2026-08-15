"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { HubIcon } from "@/components/icons";
import type { PublicAdmin } from "@/lib/types";

export function AdminTopbar({
  admin,
  onMenuClick,
}: {
  admin: PublicAdmin;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b border-black/5 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-600 hover:bg-black/5 lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {admin.role === "super_admin" ? "Super Admin" : "Admin"}
      </span>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full"
          >
            <UserAvatar name={admin.name} avatarUrl={admin.avatarUrl} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
              <div className="border-b border-black/5 px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-ink">
                  {admin.name}
                </p>
                <p className="truncate text-xs text-neutral-400">
                  {admin.email}
                </p>
              </div>
              <Link
                href="/admin/settings"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-black/5"
              >
                <HubIcon name="gear" className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
