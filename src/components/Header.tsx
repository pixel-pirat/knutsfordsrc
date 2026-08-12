"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Knutsford University crest"
            width={440}
            height={398}
            priority
            className="h-12 w-auto shrink-0"
          />
          <span className="text-lg font-bold tracking-tight sm:text-xl">
            <span className="text-gold-dark">KNUTSFORD</span>{" "}
            <span className="text-ink">UNIVERSITY</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  active ? "text-gold-dark" : "text-neutral-600 hover:text-ink"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-dark">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <a
            href="#login"
            className="rounded-md bg-neutral-100 px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Login
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
                    active ? "text-gold-dark" : "text-neutral-700"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-dark">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <a
              href="#login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-ink px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Login
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
