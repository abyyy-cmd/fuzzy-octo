"use client"

import * as React from "react"
import Link from "next/link"
import {
  Building2,
  ArrowLeft,
  PhoneCall,
  CalendarCheck,
  Calendar,
  Clock,
  Mail,
  User,
  ExternalLink,
  Sparkles,
  Search,
  Key,
  Layers,
  CheckCircle2,
  PauseCircle,
  TrendingUp,
  Inbox,
  Radio,
  FileText,
  Eye,
  ArrowUpRight,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { WorkspaceRecord, LeadRecord } from "@/db/queries"
import type { CallHistoryRecord } from "@/context/vapi-context"
import { getCategoryHeader, inferCallCategory } from "@/lib/call-categorization"

interface AdminWorkspaceDetailViewProps {
  workspace: WorkspaceRecord
  leads: LeadRecord[]
}

function isMeetingBooked(call: CallHistoryRecord): boolean {
  const disp =
    call.disposition ||
    call.analysis?.structuredData?.disposition ||
    (call as any).structuredData?.disposition ||
    ""
  const norm = disp.toLowerCase().replace(/[\s-_]+/g, "_")
  return norm === "meeting_booked" || norm === "booked"
}

function renderDispositionBadge(disposition?: string) {
  if (!disposition) {
    return (
      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 text-[11px] font-mono">
        Pending / Ended
      </Badge>
    )
  }

  const norm = disposition.toLowerCase().replace(/[\s-_]+/g, "_")

  if (norm === "meeting_booked" || norm === "booked") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-medium text-[11px] px-2 py-0.5 shadow-none">
        Meeting Booked
      </Badge>
    )
  }

  if (norm === "not_booked" || norm === "notbooked") {
    return (
      <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-medium text-[11px] px-2 py-0.5 shadow-none">
        Not Booked
      </Badge>
    )
  }

  return (
    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 font-medium text-[11px] px-2 py-0.5 shadow-none capitalize">
      {disposition.replace(/_/g, " ")}
    </Badge>
  )
}

export function AdminWorkspaceDetailView({
  workspace,
  leads,
}: AdminWorkspaceDetailViewProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const storageKey = `omnireach_call_logs_${workspace.nicheType}`

  const [calls, setCalls] = React.useState<CallHistoryRecord[]>([])
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [status, setStatus] = React.useState<"ACTIVE" | "PAUSED">("ACTIVE")

  // Load tenant specific calls from localStorage AND sync from Neon Postgres database
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          setCalls(JSON.parse(saved))
        } else {
          const defaultSaved = localStorage.getItem("omnireach_call_logs_default")
          if (defaultSaved) {
            setCalls(JSON.parse(defaultSaved))
          }
        }
      } catch (err) {
        console.error("Error loading tenant calls from localStorage:", err)
      }

      // Fetch latest logs from database for this tenant
      fetch(`/api/vapi/logs?workspace=${encodeURIComponent(workspace.nicheType)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.logs)) {
            const dbCalls: CallHistoryRecord[] = data.logs.map((log: any) => {
              const cat = log.callCategory || inferCallCategory(
                {
                  callCategory: log.callCategory,
                  summary: log.summary,
                  messages: Array.isArray(log.transcript) ? log.transcript : [],
                },
                workspace.nicheType
              )

              return {
                id: log.id,
                vapiCallId: log.vapiCallId || undefined,
                customerNumber: log.customerNumber || undefined,
                callCategory: cat,
                disposition: log.callStatus || undefined,
                date: log.createdAt
                  ? new Date(log.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString(),
                duration: log.duration || "0:00",
                direction: (log.callDirection === "Inbound" || log.callDirection === "inboundPhoneCall" ? "Inbound" : "Outbound") as any,
                messages: Array.isArray(log.transcript) ? log.transcript : [],
                analysis: {
                  summary: log.summary,
                  structuredData: {
                    callCategory: cat,
                    callStatus: log.callStatus,
                  },
                },
              }
            })

            if (dbCalls.length > 0) {
              setCalls((prev) => {
                const dbIds = new Set(dbCalls.map((c) => String(c.id)))
                const dbVapiIds = new Set(dbCalls.map((c) => String(c.vapiCallId || "")))
                const freshLocal = prev.filter(
                  (p) => !dbIds.has(String(p.id)) && !dbVapiIds.has(String(p.vapiCallId || ""))
                )
                const merged = [...dbCalls, ...freshLocal]
                localStorage.setItem(storageKey, JSON.stringify(merged))
                return merged
              })
            }
          }
        })
        .catch((err) => console.error("Error syncing tenant calls from DB:", err))
        .finally(() => {
          setIsLoaded(true)
        })
    }
  }, [storageKey, workspace.nicheType])

  const toggleStatus = () => {
    const next = status === "ACTIVE" ? "PAUSED" : "ACTIVE"
    setStatus(next)
    toast.success(`${workspace.name} status switched to ${next}`)
  }

  // Filter for meetings
  const bookedMeetings = React.useMemo(() => {
    return calls.filter((c) => isMeetingBooked(c))
  }, [calls])

  // Filtered calls by search
  const filteredCalls = React.useMemo(() => {
    if (!searchQuery.trim()) return calls
    const q = searchQuery.toLowerCase()
    return calls.filter((c) => {
      const matchId = String(c.id).toLowerCase().includes(q)
      const matchNumber = c.customerNumber?.toLowerCase().includes(q)
      const matchDate = c.date?.toLowerCase().includes(q)
      const matchDisp = (
        c.disposition ||
        c.analysis?.structuredData?.disposition ||
        ""
      ).toLowerCase().includes(q)
      const matchTranscript = c.messages.some((m) =>
        m.text.toLowerCase().includes(q)
      )
      return matchId || matchNumber || matchDate || matchDisp || matchTranscript
    })
  }, [calls, searchQuery])

  const totalCalls = calls.length
  const totalBooked = bookedMeetings.length
  const conversionRate = totalCalls > 0 ? Math.round((totalBooked / totalCalls) * 100) : 0

  const vapiAssistantId =
    workspace.nicheType === "legal"
      ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_LEGAL || "asst_legal_prod_01"
      : workspace.nicheType === "dental"
      ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_DENTAL || "asst_dental_prod_02"
      : "asst_default_prod_00"

  const isLaw = workspace.nicheType === "legal" || workspace.nicheType === "luca_law" || workspace.nicheType.toLowerCase().includes("law")
  const isDental = workspace.nicheType === "dental" || workspace.nicheType === "luca_dental" || workspace.nicheType.toLowerCase().includes("dental")
  const categoryHeader = isLaw ? "Matter Type" : isDental ? "Service Requested" : "Call Category"

  if (!isMounted) return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/workspaces"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1.5 cursor-pointer text-xs w-fit p-0 hover:bg-transparent text-muted-foreground hover:text-foreground",
          })}
        >
          <ArrowLeft className="size-4" />
          Back to Workspaces
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleStatus}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            {status === "ACTIVE" ? (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Tenant: Active</span>
              </>
            ) : (
              <>
                <PauseCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Tenant: Paused</span>
              </>
            )}
          </Button>

          <Link
            href={`/omnireach?workspace=${workspace.nicheType}`}
            className={buttonVariants({
              size: "sm",
              className: "h-8 text-xs gap-1.5 cursor-pointer shadow-xs",
            })}
          >
            <Layers className="size-3.5" />
            Impersonate Client Portal
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Tenant Header Card */}
      <Card className="shadow-2xs border-border/80">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base shadow-xs">
                {workspace.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-xl font-bold text-foreground">
                    {workspace.name}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono text-xs capitalize">
                    <Sparkles className="size-3 text-primary mr-1" />
                    {workspace.nicheType} Instance
                  </Badge>
                  <Badge
                    className={
                      status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-mono text-[10px]"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 font-mono text-[10px]"
                    }
                  >
                    {status}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                  Tenant ID: <span className="font-mono">{workspace.id}</span> • Created:{" "}
                  <span className="font-mono">
                    {workspace.createdAt
                      ? new Date(workspace.createdAt).toLocaleDateString()
                      : "Active"}
                  </span>
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1 text-xs">
              <span className="text-muted-foreground text-[11px] font-mono uppercase font-semibold">
                Vapi Voice Assistant
              </span>
              <div className="flex items-center gap-1.5 font-mono text-foreground font-medium bg-muted/50 border px-2.5 py-1 rounded-md">
                <Key className="size-3 text-muted-foreground" />
                <span>{vapiAssistantId}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Tenant Performance Metrics Grid */}
        <CardContent className="pt-4 grid sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <PhoneCall className="size-3.5 text-primary" /> Total Voice Calls
            </span>
            <div className="text-2xl font-bold font-mono text-foreground">
              {totalCalls}
            </div>
            <span className="text-[11px] text-muted-foreground block font-mono">
              Recorded in tenant log
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CalendarCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Booked Meetings
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalBooked}
            </div>
            <span className="text-[11px] text-muted-foreground block font-mono">
              Qualified consultations
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-primary" /> Booking Rate
            </span>
            <div className="text-2xl font-bold font-mono text-foreground">
              {conversionRate}%
            </div>
            <span className="text-[11px] text-muted-foreground block font-mono">
              Call-to-meeting ratio
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <User className="size-3.5 text-primary" /> Sourced Leads
            </span>
            <div className="text-2xl font-bold font-mono text-foreground">
              {leads.length || 0}
            </div>
            <span className="text-[11px] text-muted-foreground block font-mono">
              Target prospective leads
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Booked Meetings Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">
              Booked Consultations ({bookedMeetings.length})
            </h2>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            Analysis Engine Confirmed
          </Badge>
        </div>

        {bookedMeetings.length === 0 ? (
          <Card className="shadow-2xs border-border/80">
            <CardContent className="p-8 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">No meetings booked yet for this tenant.</p>
              <p>When the Vapi AI receptionist completes a qualifying call, booked consultations will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookedMeetings.map((call) => {
              const struct =
                call.analysis?.structuredData || (call as any).structuredData || {}
              const clientName =
                struct.name ||
                struct.clientName ||
                struct.customerName ||
                (call.customerNumber ? `Caller (${call.customerNumber})` : `Lead #${String(call.id).slice(-6)}`)
              const phone = call.customerNumber || struct.phone || null
              const email = struct.email || null
              const meetingDateTime =
                struct.dateTime || struct.meetingTime || struct.appointmentTime || call.date
              const summary =
                call.analysis?.summary ||
                struct.notes ||
                call.messages[call.messages.length - 1]?.text ||
                "Consultation scheduled by AI Voice Agent."

              return (
                <Card key={call.id} className="shadow-2xs border-border/80 flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <User className="size-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {clientName}
                          </CardTitle>
                          <CardDescription className="text-[10px] font-mono">
                            Call #{String(call.id).slice(-8)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-[10px] shadow-none">
                        Confirmed
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-3 space-y-2.5 text-xs flex-1">
                    <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold font-mono text-xs">{meetingDateTime}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {phone && (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground">
                          <PhoneCall className="size-3 text-primary" />
                          <span>{phone}</span>
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-foreground truncate">
                          <Mail className="size-3 text-primary" />
                          <span>{email}</span>
                        </div>
                      )}
                    </div>

                    {summary && (
                      <div className="p-2 rounded bg-muted/40 border text-[11px] text-muted-foreground line-clamp-2">
                        {summary}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 pb-3 border-t flex justify-end">
                    <Link
                      href={`/calls/${call.id}?workspace=${workspace.nicheType}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "h-6 text-xs gap-1 text-primary hover:text-primary cursor-pointer font-medium p-0 hover:bg-transparent",
                      })}
                    >
                      View Transcript
                      <ExternalLink className="size-3" />
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Tenant Call Logs Table */}
      <Card className="shadow-2xs border-border/80">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <PhoneCall className="size-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Tenant Voice Call Logs ({calls.length})
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                All incoming and outbound voice qualification sessions for {workspace.name}
              </CardDescription>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tenant calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[160px] font-mono text-xs">Call ID</TableHead>
                <TableHead className="font-mono text-xs">Caller ID</TableHead>
                <TableHead className="font-mono text-xs">Date & Time</TableHead>
                <TableHead className="font-mono text-xs">Duration</TableHead>
                <TableHead className="font-mono text-xs">Direction</TableHead>
                <TableHead className="font-mono text-xs">{categoryHeader}</TableHead>
                <TableHead className="font-mono text-xs">Turns</TableHead>
                <TableHead className="text-right font-mono text-xs">Transcript</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoaded ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                    Loading tenant calls...
                  </TableCell>
                </TableRow>
              ) : filteredCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Inbox className="size-5 text-muted-foreground" />
                      <p className="font-medium text-foreground">No call sessions recorded for this workspace.</p>
                      <p className="text-[11px]">Dial from the AI Assistant inside the client portal to generate logs.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalls.map((call) => {
                  const callIdShort = String(call.id).slice(-8)
                  const timestampStr = call.messages[0]?.timestamp || "Completed"
                  const callCategory =
                    call.callCategory ||
                    call.analysis?.structuredData?.callCategory ||
                    (call as any).structuredData?.callCategory
                  const callDisposition =
                    callCategory ||
                    call.disposition ||
                    call.analysis?.structuredData?.disposition ||
                    (call as any).structuredData?.disposition

                  return (
                    <TableRow key={call.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        call_{callIdShort}
                      </TableCell>

                      <TableCell>
                        {call.customerNumber ? (
                          <div className="flex items-center gap-1 font-mono text-xs text-foreground font-medium">
                            <PhoneCall className="size-3 text-primary" />
                            <span>{call.customerNumber}</span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground">
                            WebRTC
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-foreground">{call.date}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{timestampStr}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <Clock className="size-3 text-muted-foreground" />
                          <span>{call.duration}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {call.direction || "Outbound"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-foreground font-medium">
                        {inferCallCategory(call, workspace.nicheType)}
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        {call.messages.length} msg{call.messages.length === 1 ? "" : "s"}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link
                          href={`/calls/${call.id}?workspace=${workspace.nicheType}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "h-7 text-xs gap-1 cursor-pointer font-medium",
                          })}
                        >
                          <FileText className="size-3" />
                          Inspect
                          <ArrowUpRight className="size-3 text-muted-foreground" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
