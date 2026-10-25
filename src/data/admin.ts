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
    label: "Marketplace",
    href: "#",
    icon: "storefront",
    permission: "manage_market",
    items: [
      { label: "Overview", href: "/admin/market", icon: "dashboard", permission: "manage_market" },
      { label: "Store Applications", href: "/admin/market/applications", icon: "flag", permission: "manage_market" },
      { label: "Registered Sellers", href: "/admin/market/sellers", icon: "users", permission: "manage_market" },
      { label: "Store Management", href: "/admin/market/stores", icon: "storefront", permission: "manage_market" },
      { label: "Products & Services", href: "/admin/market/products", icon: "book", permission: "manage_market" },
      { label: "Orders & Transactions", href: "/admin/market/orders", icon: "wallet", permission: "manage_market" },
      { label: "Complaints & Disputes", href: "/admin/market/complaints", icon: "flag", permission: "manage_market" },
      { label: "Reviews & Reports", href: "/admin/market/reviews", icon: "trophy", permission: "manage_market" },
      { label: "Marketplace Analytics", href: "/admin/market/analytics", icon: "dashboard", permission: "manage_market" },
      { label: "Marketplace Settings", href: "/admin/market/settings", icon: "gear", permission: "manage_market" },
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
