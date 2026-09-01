"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronsUpDown, Scale, Stethoscope, Building2, Check } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { WorkspaceRecord } from "@/db/queries"

const DEFAULT_WORKSPACES: WorkspaceRecord[] = [
  {
    id: "ws-legal",
    name: "Law Firms",
    nicheType: "legal",
    createdAt: new Date(),
  },
  {
    id: "ws-dental",
    name: "Dental Clinics",
    nicheType: "dental",
    createdAt: new Date(),
  },
]

function WorkspaceIcon({ niche, className }: { niche?: string; className?: string }) {
  if (niche === "legal") return <Scale className={className} />
  if (niche === "dental") return <Stethoscope className={className} />
  return <Building2 className={className} />
}

interface WorkspaceSwitcherProps {
  workspaces?: WorkspaceRecord[]
}

export function WorkspaceSwitcher({ workspaces = DEFAULT_WORKSPACES }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const list = workspaces.length > 0 ? workspaces : DEFAULT_WORKSPACES
  const currentWorkspaceValue = searchParams.get("workspace") || list[0]?.nicheType || "legal"

  const activeWorkspace =
    list.find((w) => w.nicheType === currentWorkspaceValue || w.id === currentWorkspaceValue) || list[0]

  const handleWorkspaceChange = (workspace: WorkspaceRecord) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("workspace", workspace.nicheType)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex w-full items-center justify-between gap-2 rounded-lg p-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer border border-sidebar-border"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <WorkspaceIcon niche={activeWorkspace?.nicheType} className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeWorkspace?.name || "Select Workspace"}</span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {activeWorkspace?.nicheType ? `${activeWorkspace.nicheType} niche` : "Workspace"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 opacity-50 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces ({list.length})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {list.map((workspace) => {
                const isSelected =
                  workspace.nicheType === activeWorkspace?.nicheType ||
                  workspace.id === activeWorkspace?.id

                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => handleWorkspaceChange(workspace)}
                    className="cursor-pointer flex items-center justify-between gap-2 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                        <WorkspaceIcon niche={workspace.nicheType} className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{workspace.name}</span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {workspace.nicheType} niche
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
