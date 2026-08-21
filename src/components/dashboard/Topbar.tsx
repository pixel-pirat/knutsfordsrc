"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { HubIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { PublicStudent } from "@/lib/types";

export function Topbar({
  student,
  onMenuClick,
}: {
  student: PublicStudent;
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
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="hidden flex-1 items-center gap-2 rounded-md bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 text-sm text-neutral-400 dark:text-neutral-500 sm:flex sm:max-w-sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" strokeLinecap="round" />
        </svg>
        <span className="flex-1">Type to search...</span>
        <kbd className="rounded border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 004 0" strokeLinecap="round" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full"
          >
            <span className="relative inline-flex">
              <UserAvatar name={`${student.firstName} ${student.lastName}`} avatarUrl={student.avatarUrl} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-900 bg-green-500" />
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl bg-white dark:bg-neutral-900 p-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
              <div className="border-b border-black/5 dark:border-white/10 px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-ink dark:text-neutral-100">
                  {student.firstName} {student.lastName}
                </p>
                <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
                  {student.indexNumber}
                </p>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <HubIcon name="gear" className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
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
