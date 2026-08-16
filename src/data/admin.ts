import type { PermissionKey } from "@/lib/permissions";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  permission?: PermissionKey;
  superAdminOnly?: boolean;
};

export const adminNav: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: "dashboard" },
  { label: "Permits", href: "/admin/permits", icon: "id", permission: "view_permits" },
  { label: "Students", href: "/admin/students", icon: "users", permission: "view_students" },
  { label: "Audit Trail", href: "/admin/audit", icon: "flag", permission: "view_audit_log" },
  { label: "Programmes", href: "/admin/programs", icon: "book", superAdminOnly: true },
  { label: "Admins", href: "/admin/admins", icon: "gear", superAdminOnly: true },
];
