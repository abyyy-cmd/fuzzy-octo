"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Users,
  Mail,
  MessageSquareReply,
  UploadCloud,
  ArrowUpRight,
  Sparkles,
  Building2,
  PhoneCall,
  Inbox,
} from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SlideOutPanel } from "@/components/slide-out-panel"
import { UploadLeadsDialog } from "@/components/upload-leads"
import { fetchWorkspaceLeads } from "@/app/actions/leads"
import type { LeadRecord } from "@/db/queries"

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

export function OverviewView() {
  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || "legal"

  const [leads, setLeads] = React.useState<LeadRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedLead, setSelectedLead] = React.useState<LeadRecord | null>(null)
  const [isUploadOpen, setIsUploadOpen] = React.useState(false)

  // Fetch real leads from Neon Postgres via Server Action
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

  // Compute dynamic metrics directly from database records
  const totalSourced = leads.length
  const emailsSent = leads.filter((l) => l.channel === "manyreach" && l.leadStatus !== "prospecting").length
  const repliesReceived = leads.filter((l) => l.leadStatus === "replied" || l.leadStatus === "booked").length

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "booked":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 border-transparent font-medium text-xs">
            Meeting Booked
          </Badge>
        )
      case "replied":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 border-transparent font-medium text-xs">
            Replied
          </Badge>
        )
      case "contacted":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 border-transparent font-medium text-xs">
            Contacted
          </Badge>
        )
      case "prospecting":
      default:
        return (
          <Badge variant="secondary" className="font-medium text-xs capitalize">
            {status || "prospecting"}
          </Badge>
        )
    }
  }

  const getChannelBadge = (channel: string | null) => {
    switch (channel) {
      case "manyreach":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <Mail className="h-3.5 w-3.5" />
            Manyreach Email
          </span>
        )
      case "linkedin":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium">
            <LinkedinIcon className="h-3.5 w-3.5" />
            LinkedIn
          </span>
        )
      case "vapi":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <PhoneCall className="h-3.5 w-3.5" />
            Vapi Voice
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Mail className="h-3.5 w-3.5" />
            {channel || "Email"}
          </span>
        )
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {workspaceTitle} Overview
            </h1>
            <Badge variant="outline" className="gap-1 font-mono text-[11px]">
              <Sparkles className="h-3 w-3 text-primary" />
              Workspace: {currentWorkspace}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            OmniReach omnichannel outreach sequences across cold email, LinkedIn, and AI voice calls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="gap-2 shadow-xs cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            Import Leads
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards (Calculated dynamically from database) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads Sourced
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalSourced}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {totalSourced > 0 ? `${totalSourced} accounts tracked` : "No leads sourced yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Emails Sent
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {emailsSent}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {emailsSent > 0 ? `${emailsSent} active sequences` : "0 active sequences"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Replies Received
            </CardTitle>
            <MessageSquareReply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {repliesReceived}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {repliesReceived > 0 ? `${repliesReceived} prospect responses` : "0 responses"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table Section */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Active Leads Pipeline</CardTitle>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {leads.length} accounts
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px]">Company Name</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Outbound Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Touch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Loading workspace leads from Neon Postgres...
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
                      <Button
                        size="sm"
                        onClick={() => setIsUploadOpen(true)}
                        className="gap-2 cursor-pointer shadow-xs mt-2"
                      >
                        <UploadCloud className="size-4" />
                        Import Leads
                      </Button>
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
                        <div className="flex size-7 items-center justify-center rounded-md border bg-background text-muted-foreground">
                          <Building2 className="size-3.5" />
                        </div>
                        <span className="text-sm font-semibold text-foreground flex items-center gap-1 group">
                          {lead.companyName}
                          <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {lead.primaryContact || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {lead.email || "—"}
                    </TableCell>
                    <TableCell>
                      {getChannelBadge(lead.channel)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lead.leadStatus)}
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

      {/* Upload Modal Dialog */}
      <UploadLeadsDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />

      {/* Slide-out Unified Thread View */}
      <SlideOutPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  )
}

// Aliases for backwards compatibility and clarity
export const OmniReachView = OverviewView
export const MarketplaceView = OverviewView
