"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/dashboard/store" },
  { label: "Products", href: "/dashboard/store/products" },
  { label: "Services", href: "/dashboard/store/services" },
  { label: "Inventory", href: "/dashboard/store/inventory" },
  { label: "Settings", href: "/dashboard/store/settings" },
];

export function SellerNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1.5 overflow-x-auto rounded-xl bg-white p-1.5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      {items.map((item) => {
        const active =
          item.href === "/dashboard/store"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-ink text-white dark:bg-gold dark:text-ink"
                : "text-neutral-500 hover:bg-black/[0.04] hover:text-ink dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
