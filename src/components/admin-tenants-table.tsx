"use client"

import * as React from "react"
import Link from "next/link"
import {
  Building2,
  PhoneCall,
  ArrowUpRight,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  Sparkles,
  Search,
  Key,
  Calendar,
  Layers,
  Plus,
  X,
  Check,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { toast } from "sonner"
import type { WorkspaceRecord } from "@/db/queries"

interface AdminTenantsTableProps {
  initialWorkspaces: WorkspaceRecord[]
}

export function AdminTenantsTable({ initialWorkspaces }: AdminTenantsTableProps) {
  const [workspaces, setWorkspaces] = React.useState(
    initialWorkspaces.map((ws) => ({
      ...ws,
      status: "ACTIVE" as "ACTIVE" | "PAUSED" | "SUSPENDED",
      vapiId:
        ws.nicheType === "legal"
          ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_LEGAL || "asst_legal_prod_01"
          : ws.nicheType === "dental"
          ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_DENTAL || "asst_dental_prod_02"
          : "asst_default_prod_00",
    }))
  )

  const [searchQuery, setSearchQuery] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [newTenantName, setNewTenantName] = React.useState("")
  const [newNicheType, setNewNicheType] = React.useState("legal")
  const [newVapiId, setNewVapiId] = React.useState("")

  const toggleStatus = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id === id) {
          const nextStatus =
            ws.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
          toast.success(`${ws.name} status updated to ${nextStatus}`)
          return { ...ws, status: nextStatus }
        }
        return ws
      })
    )
  }

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTenantName.trim()) {
      toast.error("Please enter a workspace name")
      return
    }

    const newWs = {
      id: `ws-${Date.now()}`,
      name: newTenantName.trim(),
      nicheType: newNicheType.toLowerCase().trim(),
      createdAt: new Date(),
      status: "ACTIVE" as const,
      vapiId: newVapiId.trim() || `asst_${newNicheType}_${Date.now().toString().slice(-4)}`,
    }

    setWorkspaces((prev) => [newWs, ...prev])
    toast.success(`Created tenant workspace: ${newWs.name}`)
    setNewTenantName("")
    setNewVapiId("")
    setIsCreating(false)
  }

  const filtered = workspaces.filter((ws) => {
    const q = searchQuery.toLowerCase()
    return (
      ws.name.toLowerCase().includes(q) ||
      ws.nicheType.toLowerCase().includes(q) ||
      ws.vapiId.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Create Workspace Panel (Collapsible) */}
      {isCreating && (
        <Card className="shadow-xs border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Plus className="size-4 text-primary" />
                  Provision New Tenant Workspace
                </CardTitle>
                <CardDescription className="text-xs">
                  Create an isolated client workspace for a Law Firm, Dental Clinic, or Custom Niche
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsCreating(false)}
                className="cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <form onSubmit={handleCreateWorkspace}>
            <CardContent className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ws-name" className="text-xs">Tenant / Firm Name</Label>
                  <Input
                    id="ws-name"
                    placeholder="e.g. Sterling & Partners LLP"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ws-niche" className="text-xs">Niche Classification</Label>
                  <select
                    id="ws-niche"
                    value={newNicheType}
                    onChange={(e) => setNewNicheType(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="legal">Legal Intake (Law Firm)</option>
                    <option value="dental">Dental Clinic</option>
                    <option value="realestate">Real Estate</option>
                    <option value="medical">Medical Practice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ws-vapi" className="text-xs">Vapi Assistant ID (Optional)</Label>
                  <Input
                    id="ws-vapi"
                    placeholder="asst_..."
                    value={newVapiId}
                    onChange={(e) => setNewVapiId(e.target.value)}
                    className="h-8 text-xs bg-background font-mono"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="h-7 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                <Check className="size-3.5" />
                Provision Workspace
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="shadow-2xs border-border/80">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Registered Tenant Workspaces
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Manage multi-tenant law firm and dental clinic environments, Vapi assistant routing, and active provisioning
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search tenants, niches, or IDs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              {!isCreating && (
                <Button
                  size="sm"
                  onClick={() => setIsCreating(true)}
                  className="h-8 text-xs gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  Create Workspace
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-xs">Tenant Name</TableHead>
                <TableHead className="font-mono text-xs">Niche Type</TableHead>
                <TableHead className="font-mono text-xs">Vapi Assistant ID</TableHead>
                <TableHead className="font-mono text-xs">Created Date</TableHead>
                <TableHead className="font-mono text-xs">Status Toggle</TableHead>
                <TableHead className="text-right font-mono text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No tenants matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ws) => (
                  <TableRow
                    key={ws.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold font-mono text-[11px]">
                          {ws.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{ws.name}</span>
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            ID: {ws.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[11px] capitalize"
                      >
                        <Sparkles className="size-3 text-primary mr-1" />
                        {ws.nicheType}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground">
                        <Key className="size-3 text-muted-foreground" />
                        <span className="truncate max-w-[180px]" title={ws.vapiId}>
                          {ws.vapiId}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span>
                          {ws.createdAt
                            ? new Date(ws.createdAt).toLocaleDateString()
                            : "Active"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(ws.id)}
                        className="h-7 px-2 text-xs gap-1.5 cursor-pointer hover:bg-muted"
                      >
                        {ws.status === "ACTIVE" ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-mono text-[10px] shadow-none">
                              Active
                            </Badge>
                          </>
                        ) : (
                          <>
                            <PauseCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 font-mono text-[10px] shadow-none">
                              Paused
                            </Badge>
                          </>
                        )}
                      </Button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/workspaces/${ws.nicheType || ws.id}`}
                          className={buttonVariants({
                            size: "sm",
                            className: "h-7 text-xs gap-1 cursor-pointer font-medium shadow-2xs",
                          })}
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="size-3" />
                        </Link>
                        <Link
                          href={`/omnireach?workspace=${ws.nicheType}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "h-7 text-xs gap-1 cursor-pointer font-medium",
                          })}
                          title="Impersonate into client workspace"
                        >
                          <Layers className="size-3" />
                          <span>Portal</span>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
