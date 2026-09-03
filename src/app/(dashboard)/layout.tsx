import * as React from "react"
import { AppSidebarClient as AppSidebar } from "@/components/sidebar-client-wrapper"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { VapiProvider } from "@/context/vapi-context"
import { getWorkspaces } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dbWorkspaces = await getWorkspaces()

  return (
    <TooltipProvider>
      <VapiProvider>
        <SidebarProvider>
          <AppSidebar workspaces={dbWorkspaces} />
          <SidebarInset className="min-h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-xs">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>Omnichannel Engine</span>
                <span>/</span>
                <span className="text-foreground font-semibold">Admin Panel</span>
              </div>
            </header>
            <div className="flex flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </VapiProvider>
    </TooltipProvider>
  )
}
