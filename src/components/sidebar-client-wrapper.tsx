"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type { WorkspaceRecord } from "@/db/queries"

const AppSidebar = dynamic(
  () => import("@/components/app-sidebar").then((mod) => mod.AppSidebar),
  {
    ssr: false,
    loading: () => <div className="w-64 border-r bg-sidebar h-full hidden md:block" />,
  }
)

export function AppSidebarClient({ workspaces }: { workspaces?: WorkspaceRecord[] }) {
  return <AppSidebar workspaces={workspaces} />
}
