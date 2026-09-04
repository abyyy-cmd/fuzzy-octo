"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  LogOut,
  ExternalLink,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { logoutAction } from "@/app/login/actions"

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Workspaces (Tenants)",
    href: "/admin/workspaces",
    icon: Building2,
  },
  {
    title: "Global Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "System Health",
    href: "/admin/health",
    icon: Activity,
  },
]

interface AdminSidebarProps {
  userEmail?: string | null
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Header Brand */}
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-foreground block">
              OmniReach Admin
            </span>
            <span className="text-[10px] text-muted-foreground font-medium block">
              Super Admin Console
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-muted text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer info & Logout */}
      <div className="space-y-3 pt-6 border-t border-border">
        <div className="rounded-lg bg-muted/50 p-2.5 text-xs space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">
              Operator
            </span>
            <Badge
              variant="outline"
              className="text-[9px] font-mono border-primary/20 text-primary bg-primary/5"
            >
              SUPERADMIN
            </Badge>
          </div>
          <span className="text-xs font-medium text-foreground truncate block font-mono">
            {userEmail || "admin@crm.com"}
          </span>
        </div>

        <Link
          href="/omnireach"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "w-full text-xs justify-between font-medium cursor-pointer",
          })}
        >
          <span>Client Workspace</span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </Link>

        <form action={logoutAction} className="w-full">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 font-medium"
          >
            <LogOut className="size-3.5" />
            Sign Out Super Admin
          </Button>
        </form>
      </div>
    </aside>
  )
}
