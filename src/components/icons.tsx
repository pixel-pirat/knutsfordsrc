import type { ReactElement } from "react";

export function CrestIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 3l16 6v11c0 11.5-7 19.5-16 25-9-5.5-16-13.5-16-25V9l16-6z"
        fill="url(#crest-gradient)"
      />
      <path
        d="M24 3l16 6v11c0 11.5-7 19.5-16 25-9-5.5-16-13.5-16-25V9l16-6z"
        stroke="#8a6a1a"
        strokeWidth="0.75"
      />
      <path
        d="M24 12a6 6 0 016 6c0 3-2 4.5-2 6.5V27h-8v-2.5c0-2-2-3.5-2-6.5a6 6 0 016-6z"
        fill="#fff8e6"
      />
      <rect x="20.5" y="27" width="7" height="4" rx="0.5" fill="#fff8e6" />
      <path d="M18 33h12l-1.5 3H19.5L18 33z" fill="#fff8e6" />
      <defs>
        <linearGradient
          id="crest-gradient"
          x1="8"
          y1="3"
          x2="40"
          y2="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e8c976" />
          <stop offset="0.5" stopColor="#c9962f" />
          <stop offset="1" stopColor="#9c7420" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SrcCrest({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="src-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1d68a" />
          <stop offset="0.5" stopColor="#c9962f" />
          <stop offset="1" stopColor="#8a6a1a" />
        </linearGradient>
      </defs>
      <text
        x="100"
        y="34"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="26"
        fill="url(#src-gold)"
        letterSpacing="4"
      >
        SRC
      </text>
      <g stroke="url(#src-gold)" strokeWidth="2.5" fill="none">
        <path d="M25 70c15-14 30-6 30 8-4-10-20-10-24 2 10-4 18 2 18 10 0 10-14 16-24 8" />
        <path d="M175 70c-15-14-30-6-30 8 4-10 20-10 24 2-10-4-18 2-18 10 0 10 14 16 24 8" />
      </g>
      <path
        d="M60 60h80v55c0 32-20 55-40 68-20-13-40-36-40-68V60z"
        fill="none"
        stroke="url(#src-gold)"
        strokeWidth="3"
      />
      <rect
        x="82"
        y="82"
        width="36"
        height="30"
        fill="none"
        stroke="url(#src-gold)"
        strokeWidth="2.5"
      />
      <path
        d="M82 112l4-10h28l4 10"
        fill="none"
        stroke="url(#src-gold)"
        strokeWidth="2.5"
      />
      <line
        x1="90"
        y1="82"
        x2="90"
        y2="112"
        stroke="url(#src-gold)"
        strokeWidth="1.5"
      />
      <line
        x1="100"
        y1="82"
        x2="100"
        y2="112"
        stroke="url(#src-gold)"
        strokeWidth="1.5"
      />
      <line
        x1="110"
        y1="82"
        x2="110"
        y2="112"
        stroke="url(#src-gold)"
        strokeWidth="1.5"
      />
      <path
        d="M40 150c20 14 100 14 120 0"
        fill="none"
        stroke="url(#src-gold)"
        strokeWidth="2.5"
      />
      <text
        x="100"
        y="180"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="13"
        fill="url(#src-gold)"
        letterSpacing="1"
      >
        THE LORD IS OUR STRENGTH
      </text>
      <path
        d="M35 190h130l-8 22c-30 14-84 14-114 0l-8-22z"
        fill="none"
        stroke="url(#src-gold)"
        strokeWidth="2.5"
      />
      <text
        x="100"
        y="207"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="11"
        fill="url(#src-gold)"
      >
        Knutsford University
      </text>
    </svg>
  );
}

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
