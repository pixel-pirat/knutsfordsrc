export type DashboardNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type DashboardNavEntry = DashboardNavItem & {
  items?: DashboardNavItem[];
};

export const dashboardNav: DashboardNavEntry[] = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "Digital ID", href: "/dashboard/id", icon: "id" },
  { label: "Permits", href: "/dashboard/permits", icon: "briefcase" },
  { label: "Dues", href: "/dashboard/dues", icon: "wallet" },
  { label: "My Hall", href: "/dashboard/hall", icon: "hall" },
  { label: "Sports", href: "/dashboard/sports", icon: "trophy" },
  {
    label: "Marketplace",
    href: "#",
    icon: "storefront",
    items: [
      { label: "Browse Market", href: "/dashboard/market", icon: "storefront" },
      { label: "My Orders", href: "/dashboard/market/orders", icon: "bag" },
      { label: "My Complaints", href: "/dashboard/market/complaints", icon: "flag" },
    ],
  },
  {
    label: "My Store",
    href: "#",
    icon: "briefcase",
    items: [
      { label: "Overview", href: "/dashboard/store", icon: "dashboard" },
      { label: "Orders", href: "/dashboard/store/orders", icon: "wallet" },
      { label: "Products", href: "/dashboard/store/products", icon: "book" },
      { label: "Services", href: "/dashboard/store/services", icon: "briefcase" },
      { label: "Inventory", href: "/dashboard/store/inventory", icon: "storefront" },
      { label: "Complaints", href: "/dashboard/store/complaints", icon: "flag" },
      { label: "Settings", href: "/dashboard/store/settings", icon: "gear" },
    ],
  },
  { label: "Resources", href: "/dashboard/resources", icon: "book" },
  { label: "Games", href: "/dashboard/games", icon: "gamepad" },
  { label: "Clubs", href: "/dashboard/clubs", icon: "users" },
  { label: "Events", href: "/dashboard/events", icon: "calendar" },
  { label: "News", href: "/dashboard/news", icon: "newspaper" },
  { label: "SRC Complaints", href: "/dashboard/complaints", icon: "flag" },
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
