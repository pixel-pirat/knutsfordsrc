import Image from "next/image";
import Link from "next/link";
import { footerColumns } from "@/data/site";

const socials = [
  { label: "Facebook", path: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1z" },
  { label: "Instagram", path: "M8 3h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5zm0 2a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3H8zm4 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM17.5 6.8a1 1 0 110 2 1 1 0 010-2z" },
  { label: "X", path: "M4 4l7.5 8.5L4.3 20H6l6.2-6.6L17 20h3l-7.8-8.9L19.5 4H17.8l-5.8 6.2L7 4H4z" },
  { label: "LinkedIn", path: "M4.5 4a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5zM4 9h1v11H4V9zm5 0h3.8v1.5h.05C13.3 9.4 14.5 9 16 9c3 0 4 2 4 4.6V20h-4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H9V9z" },
];

export function SiteFooterBar() {
  return (
    <footer className="bg-ink text-neutral-400 dark:text-neutral-500">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Knutsford University crest"
                width={440}
                height={398}
                className="h-10 w-auto"
              />
              <span className="text-base font-bold text-white">
                KNUTSFORD UNIVERSITY
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6">
              The Lord is Our Strength. Empowering students with the digital
              tools to thrive academically, socially and professionally.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition-colors hover:border-gold hover:text-gold"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-gold-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>Knutsford Campus, Accra</li>
              <li>info@knutsford.edu.gh</li>
              <li>+233 30 000 0000</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-neutral-500 dark:text-neutral-400 sm:flex-row">
          <p>&copy; 2026 Knutsford University. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold-light">Privacy Policy</a>
            <a href="#" className="hover:text-gold-light">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
