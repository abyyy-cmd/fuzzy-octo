"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Sparkles,
  LogOut,
  LayoutDashboard,
  Users,
  Bot,
  PhoneCall,
  CalendarCheck,
  Webhook,
  Settings,
} from "lucide-react"

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
    title: "OmniReach",
    url: "/omnireach",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
  {
    title: "AI Assistant",
    url: "/vapi",
    icon: Bot,
  },
  {
    title: "Call History",
    url: "/calls",
    icon: PhoneCall,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: CalendarCheck,
  },
  {
    title: "Webhooks",
    url: "/webhooks",
    icon: Webhook,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
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
                const isDashboard =
                  item.url === "/omnireach" &&
                  (pathname === "/omnireach" || pathname === "/overview" || pathname === "/")
                const isActive = pathname === item.url || isDashboard
                const targetUrl =
                  item.url === "/webhooks" || item.url === "/settings"
                    ? item.url
                    : `${item.url}?workspace=${currentWorkspace}`

                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={targetUrl} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="font-medium text-sm px-3 py-2"
                    >
                      {Icon && <Icon className="size-4 shrink-0" />}
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

export default AppSidebar
