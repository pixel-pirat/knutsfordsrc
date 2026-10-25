import type { PermissionKey } from "@/lib/permissions";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  permission?: PermissionKey;
  superAdminOnly?: boolean;
};

export type AdminNavEntry = AdminNavItem & {
  items?: AdminNavItem[];
};

// Sub-items under each group link to existing, real pages where that
// functionality already exists; everything else is a scaffolded
// placeholder route until it's built out.
export const adminNav: AdminNavEntry[] = [
  { label: "Overview", href: "/admin", icon: "dashboard" },
  { label: "Students", href: "/admin/students", icon: "users", permission: "view_students" },
  { label: "Permits", href: "/admin/permits", icon: "id", permission: "view_permits" },
  {
    label: "Events",
    href: "#",
    icon: "calendar",
    items: [
      { label: "New Event", href: "/admin/events?new=1", icon: "calendar", permission: "manage_events" },
      { label: "RSVP / Bookings", href: "/admin/events/rsvp", icon: "users", permission: "manage_events" },
      { label: "Feedback", href: "/admin/events/feedback", icon: "flag", permission: "manage_events" },
    ],
  },
  {
    label: "News",
    href: "#",
    icon: "newspaper",
    items: [
      { label: "New Broadcast", href: "/admin/news?new=1", icon: "newspaper", permission: "manage_news" },
      { label: "Broadcasts", href: "/admin/news", icon: "newspaper", permission: "manage_news" },
      { label: "Announcements", href: "/admin/news/announcements", icon: "newspaper", permission: "manage_news" },
      { label: "Documents", href: "/admin/news/documents", icon: "book", permission: "manage_news" },
      { label: "Suggestion Box", href: "/admin/news/suggestions", icon: "flag", permission: "manage_news" },
    ],
  },
  {
    label: "Market",
    href: "#",
    icon: "storefront",
    superAdminOnly: true,
    items: [
      { label: "Users", href: "/admin/market/users", icon: "users" },
      { label: "Products", href: "/admin/market/products", icon: "storefront" },
      { label: "Analytics", href: "/admin/market/analytics", icon: "dashboard" },
      { label: "Complaints", href: "/admin/market/complaints", icon: "flag" },
    ],
  },
  {
    label: "Games",
    href: "#",
    icon: "gamepad",
    superAdminOnly: true,
    items: [
      { label: "Users", href: "/admin/games/users", icon: "users" },
      { label: "Leaderboard", href: "/admin/games/leaderboard", icon: "trophy" },
      { label: "Games Config", href: "/admin/games/config", icon: "gear" },
    ],
  },
  {
    label: "Elections",
    href: "#",
    icon: "vote",
    superAdminOnly: true,
    items: [
      { label: "Elections", href: "/admin/elections", icon: "vote" },
      { label: "Polls", href: "/admin/elections/polls", icon: "vote" },
    ],
  },
  {
    label: "Analytics",
    href: "#",
    icon: "dashboard",
    items: [
      { label: "Audit Trail", href: "/admin/audit", icon: "flag", permission: "view_audit_log" },
      { label: "Permit / Dues Analytics", href: "/admin/analytics/permits-dues", icon: "wallet", superAdminOnly: true },
    ],
  },
  {
    label: "Executives",
    href: "#",
    icon: "vote",
    permission: "manage_executives",
    items: [
      { label: "Year Groups", href: "/admin/executives/year-groups", icon: "calendar", permission: "manage_executives" },
      { label: "Profiles", href: "/admin/executives/profiles", icon: "users", permission: "manage_executives" },
      { label: "Achievements", href: "/admin/executives/achievements", icon: "trophy", permission: "manage_executives" },
    ],
  },
  {
    label: "Hall Updates",
    href: "#",
    icon: "hall",
    items: [
      { label: "Halls", href: "/admin/halls", icon: "hall", permission: "manage_halls" },
      { label: "Events", href: "/admin/hall-events", icon: "calendar", permission: "manage_hall_events" },
      { label: "Communications", href: "/admin/communications", icon: "newspaper", permission: "manage_hall_comms" },
    ],
  },
  {
    label: "Sports",
    href: "#",
    icon: "trophy",
    permission: "manage_sports",
    items: [
      { label: "Sport Events", href: "/admin/sports/events", icon: "trophy", permission: "manage_sports" },
      { label: "Tournaments", href: "/admin/sports/tournaments", icon: "gamepad", permission: "manage_sports" },
      { label: "Schedule", href: "/admin/sports/schedule", icon: "calendar", permission: "manage_sports" },
      { label: "Announcements", href: "/admin/sports/announcements", icon: "newspaper", permission: "manage_sports" },
    ],
  },
  {
    label: "Settings",
    href: "#",
    icon: "gear",
    superAdminOnly: true,
    items: [
      { label: "Users", href: "/admin/admins", icon: "users" },
      { label: "Programmes", href: "/admin/settings?tab=programmes", icon: "book" },
      { label: "Permit Config", href: "/admin/settings?tab=permit-config", icon: "id" },
      { label: "Site Settings", href: "/admin/settings?tab=site", icon: "gear" },
    ],
  },
];
