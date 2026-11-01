"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { HubIcon } from "@/components/icons";
import { dashboardNav, type DashboardNavEntry } from "@/data/dashboard";
import type { PublicStudent } from "@/lib/types";

function pathOf(href: string) {
  return href.split("?")[0];
}

function isItemActive(pathname: string, href: string) {
  const path = pathOf(href);
  return path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(path);
}

export function DashboardSidebar({
  student,
  hasStore,
}: {
  student: PublicStudent;
  hasStore: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const visibleNav: DashboardNavEntry[] = dashboardNav.map((entry) =>
    entry.label === "My Store" && !hasStore
      ? { label: "Sell on Campus", href: "/dashboard/store", icon: "briefcase" }
      : entry
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const entry of visibleNav) {
      if (entry.items?.some((sub) => isItemActive(pathname, sub.href))) {
        initial[entry.label] = true;
      }
    }
    return initial;
  });

  useEffect(() => {
    const activeGroup = visibleNav.find((entry) =>
      entry.items?.some((sub) => isItemActive(pathname, sub.href))
    );
    if (activeGroup && !openGroups[activeGroup.label]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing open-group state to the router's pathname, an external system
      setOpenGroups((prev) => ({ ...prev, [activeGroup.label]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-gold/15">
                <Image
                  src="/logo.png"
                  alt="Knutsford University crest"
                  width={440}
                  height={398}
                  className="h-5 w-auto"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Knutsford SRC</span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Student Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-1 p-2">
          {visibleNav.map((item) => {
            if (!item.items) {
              const active = isItemActive(pathname, item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={active}
                    render={<Link href={item.href} />}
                    className="data-active:bg-ink data-active:text-white dark:data-active:bg-gold/15 dark:data-active:text-gold-light"
                  >
                    <HubIcon name={item.icon} className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={item.label}
                open={!!openGroups[item.label]}
                onOpenChange={(open) =>
                  setOpenGroups((prev) => ({ ...prev, [item.label]: open }))
                }
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton tooltip={item.label} className="group/trigger">
                        <HubIcon name={item.icon} className="h-4 w-4" />
                        <span>{item.label}</span>
                        <HubIcon
                          name="chevronDown"
                          className="ml-auto h-3.5 w-3.5 shrink-0 -rotate-90 transition-transform duration-200 group-data-panel-open/trigger:rotate-0"
                        />
                      </SidebarMenuButton>
                    }
                  />
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((sub) => {
                        const active = isItemActive(pathname, sub.href);
                        return (
                          <SidebarMenuSubItem key={sub.href}>
                            <SidebarMenuSubButton isActive={active} render={<Link href={sub.href} />}>
                              <span>{sub.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg">
                    <UserAvatar
                      name={`${student.firstName} ${student.lastName}`}
                      avatarUrl={student.avatarUrl}
                      size="sm"
                      className="h-7 w-7"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/60">
                        {student.indexNumber}
                      </span>
                    </div>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="right" align="end" className="w-56 rounded-lg">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {student.program ?? "Student"}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard/settings" />} className="cursor-pointer">
                  <HubIcon name="gear" className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive" className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
