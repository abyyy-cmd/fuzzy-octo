"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Building2, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SlideOutPanel } from "@/components/slide-out-panel"
import { fetchWorkspaceLeads } from "@/app/actions/leads"
import type { LeadRecord } from "@/db/queries"

export function LeadsView() {
  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || "legal"

  const [leads, setLeads] = React.useState<LeadRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedLead, setSelectedLead] = React.useState<LeadRecord | null>(null)

  React.useEffect(() => {
    let isMounted = true

    fetchWorkspaceLeads(currentWorkspace)
      .then((data) => {
        if (isMounted) {
          setLeads(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error("Error loading leads:", err)
        if (isMounted) {
          setLeads([])
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentWorkspace])

  const isDental = currentWorkspace === "dental"
  const workspaceTitle = isDental ? "Dental Clinics" : "Law Firms"

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {workspaceTitle} Leads Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time accounts and contact profiles stored in Neon Postgres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 text-xs shadow-xs cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            Add Lead
          </Button>
        </div>
      </div>

      <Card className="shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              All Contacts ({leads.length})
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              Workspace: {currentWorkspace}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Interaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto py-8">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                        <Inbox className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          No leads found for this workspace
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          No leads found for this workspace. Upload your sourced CSV to get started.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span className="font-semibold">{lead.companyName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{lead.primaryContact || "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {lead.email || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground capitalize">{lead.channel || "manyreach"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {lead.leadStatus || "prospecting"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {lead.lastInteractionAt
                        ? new Date(lead.lastInteractionAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SlideOutPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  )
}
