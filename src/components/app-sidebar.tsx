"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Sparkles, LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import { logoutAction } from "@/app/login/actions"
import type { WorkspaceRecord } from "@/db/queries"

const navItems = [
  {
    title: "Overview",
    url: "/overview",
  },
  {
    title: "Leads",
    url: "/leads",
  },
  {
    title: "Webhooks",
    url: "/webhooks",
  },
  {
    title: "Settings",
    url: "/settings",
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  workspaces?: WorkspaceRecord[]
}

export function AppSidebar({ workspaces, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || "legal"

  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      <SidebarHeader className="p-3 border-b space-y-2.5">
        <div className="flex items-center gap-2.5 px-1 py-0.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs">
            OR
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground">
              OmniReach
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Omnichannel CRM
            </span>
          </div>
        </div>
        <WorkspaceSwitcher workspaces={workspaces} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isOverview =
                  item.url === "/overview" &&
                  (pathname === "/overview" || pathname === "/")
                const isActive = pathname === item.url || isOverview
                const targetUrl =
                  item.url === "/webhooks" || item.url === "/settings"
                    ? item.url
                    : `${item.url}?workspace=${currentWorkspace}`

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={targetUrl} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="font-medium text-sm px-3 py-2"
                    >
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t space-y-2">
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 p-2 text-xs">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-medium text-foreground">
              OmniReach Engine
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              Neon Postgres • Auth.js
            </span>
          </div>
        </div>

        <form action={logoutAction} className="w-full">
          <SidebarMenuButton
            type="submit"
            tooltip="Log Out"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer font-medium"
          >
            <LogOut className="size-4 text-destructive" />
            <span>Log Out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
