import type { ReactElement } from "react";

const icons: Record<string, ReactElement> = {
  dashboard: (
    <path
      d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 7h7v9h-7v-9zM4 14h7v6H4v-6z"
      fill="currentColor"
    />
  ),
  calendar: (
    <path
      d="M7 2v3M17 2v3M3.5 8.5h17M5 5h14a1.5 1.5 0 011.5 1.5V19A1.5 1.5 0 0119 20.5H5A1.5 1.5 0 013.5 19V6.5A1.5 1.5 0 015 5zm2.5 8h3v3h-3v-3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  storefront: (
    <path
      d="M3.5 9.5L5 4h14l1.5 5.5M3.5 9.5a2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 005 0M4.5 10v9a1 1 0 001 1h13a1 1 0 001-1v-9M9.5 20v-5a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0114.5 15v5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  id: (
    <path
      d="M3.5 6h17a1 1 0 011 1v10a1 1 0 01-1 1h-17a1 1 0 01-1-1V7a1 1 0 011-1zM8 15.5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5M9.5 10.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zM15 10h3M15 13h3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  briefcase: (
    <path
      d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7m-13 0h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1zM3 13h18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  book: (
    <path
      d="M4 5.5A1.5 1.5 0 015.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13zM20 5.5A1.5 1.5 0 0018.5 4H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  wallet: (
    <path
      d="M3.5 7A1.5 1.5 0 015 5.5h13A1.5 1.5 0 0119.5 7v10a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 17V7zM14.5 12.5h3M3.5 9.5h17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  vote: (
    <path
      d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3zM4 20h16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  users: (
    <path
      d="M8.5 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 2.5-5.5 5.5-5.5S14 17 14 20M16 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM15 14.5c2.4.3 4 2.4 4 5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  trophy: (
    <path
      d="M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M12 14v3M9 20h6M9.5 20c0-1.7.7-2.5 1.2-3h2.6c.5.5 1.2 1.3 1.2 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  gamepad: (
    <path
      d="M7 8h10a4.5 4.5 0 014.4 5.5l-.6 2.6a2.2 2.2 0 01-3.9.8L15.5 15h-7l-1.4 1.9a2.2 2.2 0 01-3.9-.8l-.6-2.6A4.5 4.5 0 017 8zM7.5 11v3M6 12.5h3M15.5 11.2h.01M17.5 12.8h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export function HubIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {icons[name] ?? icons.dashboard}
    </svg>
  );
}

export function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L10 1.5z" />
    </svg>
  );
}
