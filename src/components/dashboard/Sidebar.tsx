"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav } from "@/data/dashboard";
import { HubIcon } from "@/components/icons";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Image
          src="/logo.png"
          alt="Knutsford University crest"
          width={440}
          height={398}
          className="h-9 w-auto"
        />
        <div>
          <p className="text-sm font-bold leading-tight text-ink dark:text-neutral-100">
            Knutsford SRC
          </p>
          <p className="text-xs leading-tight text-neutral-500 dark:text-neutral-400">
            Student Dashboard
          </p>
        </div>
      </div>

      <p className="px-6 pb-2 text-xs font-semibold tracking-wide text-neutral-400 dark:text-neutral-500">
        DASHBOARD
      </p>

      <nav className="flex-1 space-y-1 px-3 pb-6">
        {dashboardNav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-ink text-white dark:bg-gold/15 dark:text-gold-light"
                  : "text-neutral-600 hover:bg-black/5 hover:text-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-100"
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
