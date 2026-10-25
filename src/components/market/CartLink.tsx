"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useMarketCart } from "@/lib/marketCart";

export function CartLink({ className = "" }: { className?: string }) {
  const { count } = useMarketCart();

  return (
    <Link
      href="/market/cart"
      aria-label={`Marketplace cart, ${count} item${count === 1 ? "" : "s"}`}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/5 hover:text-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-100 ${className}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-none text-ink">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
