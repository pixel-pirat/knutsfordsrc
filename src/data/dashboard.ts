export type DashboardNavItem = {
  label: string;
  href: string;
  icon: string;
};

export const dashboardNav: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "Dues", href: "/dashboard/dues", icon: "wallet" },
  { label: "Resources", href: "/dashboard/resources", icon: "book" },
  { label: "Games", href: "/dashboard/games", icon: "gamepad" },
  { label: "Market", href: "/dashboard/market", icon: "storefront" },
  { label: "Complaints", href: "/dashboard/complaints", icon: "flag" },
  { label: "Clubs", href: "/dashboard/clubs", icon: "users" },
  { label: "Events", href: "/dashboard/events", icon: "calendar" },
  { label: "Settings", href: "/dashboard/settings", icon: "gear" },
];

export const dues = {
  amount: "GHS 100.00",
  status: "Outstanding",
  term: "Summer JA26",
  deadline: "24th August 2026",
  total: "GHS 100.00",
  paid: "GHS 0.00",
  balance: "GHS 100.00",
};
