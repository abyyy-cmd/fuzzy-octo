"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Phone,
  PhoneCall,
  Clock,
  Calendar,
  Eye,
  Trash2,
  Radio,
  FileText,
  Search,
  Sparkles,
  Inbox,
  ArrowUpRight,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useVapi } from "@/context/vapi-context"
import type { CallHistoryRecord } from "@/context/vapi-context"

function renderDispositionBadge(disposition?: string) {
  const norm = (disposition || "").toLowerCase().replace(/[\s-_]+/g, "_")
  if (norm === "meeting_booked" || norm === "booked") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-medium text-[11px] px-2 py-0.5 shadow-none">
        Meeting Booked
      </Badge>
    )
  }
  if (norm === "not_booked" || norm === "not_interested" || norm === "unqualified") {
    return (
      <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 font-medium text-[11px] px-2 py-0.5 shadow-none">
        Not Booked
      </Badge>
    )
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 font-medium text-[11px] px-2 py-0.5 shadow-none">
      Incomplete
    </Badge>
  )
}

export function CallsView() {
  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || "legal"

  const { isCallActive, callDuration, callDirection, customerNumber, transcripts, formatTime } = useVapi()

  const storageKey = `omnireach_call_logs_${currentWorkspace}`

  const [calls, setCalls] = React.useState<CallHistoryRecord[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load calls from localStorage matching the workspace
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          setCalls(JSON.parse(saved))
        } else {
          // Fallback to default key if specific workspace has none
          const defaultSaved = localStorage.getItem("omnireach_call_logs_default")
          setCalls(defaultSaved ? JSON.parse(defaultSaved) : [])
        }
      } catch (err) {
        console.error("Failed to load calls from localStorage:", err)
        setCalls([])
      } finally {
        setIsLoaded(true)
      }
    }
  }, [currentWorkspace, storageKey, isCallActive])

  const handleClearAll = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey)
        setCalls([])
        toast.info("Workspace call logs cleared")
      } catch (err) {
        console.error("Error clearing logs:", err)
      }
    }
  }

  // Filtered calls
  const filteredCalls = React.useMemo(() => {
    if (!searchQuery.trim()) return calls
    const q = searchQuery.toLowerCase()
    return calls.filter((call) => {
      const idMatch = String(call.id).toLowerCase().includes(q)
      const dateMatch = call.date.toLowerCase().includes(q)
      const phoneMatch = call.customerNumber?.toLowerCase().includes(q)
      const dispMatch = (
        call.disposition ||
        call.analysis?.structuredData?.disposition ||
        ""
      )
        .toLowerCase()
        .includes(q)
      const textMatch = call.messages.some((m) =>
        m.text.toLowerCase().includes(q)
      )
      return idMatch || dateMatch || phoneMatch || dispMatch || textMatch
    })
  }, [calls, searchQuery])

  // Aggregate stats
  const totalCalls = calls.length + (isCallActive ? 1 : 0)
  const totalMessages =
    calls.reduce((acc, c) => acc + (c.messages?.length || 0), 0) +
    (isCallActive ? transcripts.length : 0)

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto">
      {/* Conditionally Rendered Active Call Banner */}
      {isCallActive && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
                  AI Voice Call In Progress
                </span>
                <Badge className="bg-emerald-600 text-white font-mono text-[11px] px-2 py-0.5">
                  LIVE {formatTime(callDuration)}
                </Badge>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                WebRTC session is streaming in the background. Transcripts are logging in real-time.
              </p>
            </div>
          </div>

          <Link
            href={`/vapi?workspace=${currentWorkspace}`}
            className={buttonVariants({
              size: "sm",
              className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs cursor-pointer font-medium",
            })}
          >
            <Phone className="size-3.5" />
            Return to Live Dialer
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Call History
            </h1>
            <Badge variant="outline" className="font-mono text-xs capitalize">
              <Sparkles className="size-3 text-primary mr-1" />
              Workspace: {currentWorkspace}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review detailed conversation logs, duration, and full transcripts of all completed AI voice sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/vapi?workspace=${currentWorkspace}`}
            className={buttonVariants({ size: "sm", className: "gap-2 shadow-xs cursor-pointer" })}
          >
            <PhoneCall className="size-3.5" />
            Open AI Dialer
          </Link>
          {calls.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <Trash2 className="size-3.5 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Voice Calls
            </CardTitle>
            <Phone className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalCalls}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {totalCalls > 0 ? `${totalCalls} recorded sessions` : "No calls logged yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dialogue Turns
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalMessages}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {totalMessages > 0 ? `${totalMessages} total message bubbles` : "0 transcript turns"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Voice Status
            </CardTitle>
            <Radio className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {isCallActive ? "Call In Progress" : "WebRTC Ready"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {isCallActive ? `Live connection (${formatTime(callDuration)})` : "Vapi WebRTC client operational"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Master Call History Table */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recorded Call Sessions
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect conversation turns and metadata per voice session
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search transcripts, IDs, or phone numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[170px]">Call ID</TableHead>
                <TableHead>Caller ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Disposition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Turns</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoaded ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-xs text-muted-foreground">
                    Loading call history...
                  </TableCell>
                </TableRow>
              ) : filteredCalls.length === 0 && !isCallActive ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto py-8">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                        <Inbox className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {searchQuery ? "No matching calls found" : "No calls recorded yet"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {searchQuery
                            ? "Try adjusting your search keywords."
                            : "Launch an AI qualification call from the AI Assistant tab to see call logs here."}
                        </p>
                      </div>
                      {!searchQuery && (
                        <Link
                          href={`/vapi?workspace=${currentWorkspace}`}
                          className={buttonVariants({ size: "sm", variant: "outline", className: "mt-2 text-xs" })}
                        >
                          Start a Call
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Dynamic Top Row for Active Call */}
                  {isCallActive && (
                    <TableRow className="bg-emerald-500/5 hover:bg-emerald-500/10 border-b border-emerald-500/20 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-emerald-900 dark:text-emerald-100">
                        <div className="flex items-center gap-2">
                          <span className="relative flex size-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                          </span>
                          <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Active Session</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {customerNumber ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
                            <Phone className="size-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{customerNumber}</span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground">
                            WebRTC
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                            Right Now
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Live streaming
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Clock className="size-3.5" />
                          <span>{formatTime(callDuration)}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono border-emerald-300 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                        >
                          {callDirection || "Outbound"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 font-medium text-[11px] px-2 py-0.5 shadow-none">
                          In Progress
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-[11px] px-2 py-0.5 animate-pulse shadow-2xs">
                          ● In Progress
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-mono font-medium text-foreground">
                          {transcripts.length} message{transcripts.length === 1 ? "" : "s"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Link
                          href={`/vapi?workspace=${currentWorkspace}`}
                          className={buttonVariants({
                            variant: "default",
                            size: "sm",
                            className: "h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-2xs",
                          })}
                        >
                          <Radio className="size-3" />
                          Live Dialer
                          <ArrowUpRight className="size-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Historical Completed Calls */}
                  {filteredCalls.map((call) => {
                    const callIdShort = String(call.id).slice(-8)
                    const firstAssistantTurn =
                      call.messages.find((m) => m.role === "assistant")?.text || ""
                    const timestampStr = call.messages[0]?.timestamp || "Completed"
                    const callDisposition =
                      call.disposition ||
                      call.analysis?.structuredData?.disposition ||
                      (call as any).structuredData?.disposition

                    return (
                      <TableRow key={call.id} className="cursor-pointer hover:bg-muted/40 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3 text-muted-foreground" />
                            <span>call_{callIdShort}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {call.customerNumber ? (
                            <div className="flex items-center gap-1.5 font-mono text-xs text-foreground font-medium">
                              <Phone className="size-3 text-primary" />
                              <span>{call.customerNumber}</span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground">
                              WebRTC
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1">
                              <Calendar className="size-3 text-muted-foreground" />
                              {call.date}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {timestampStr}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <Clock className="size-3 text-muted-foreground" />
                            <span>{call.duration}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[11px] font-mono">
                            {call.direction || "Outbound"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {renderDispositionBadge(callDisposition)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 text-[11px] font-medium"
                          >
                            Ended
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col max-w-[240px]">
                            <span className="text-xs font-mono font-medium">
                              {call.messages.length} message{call.messages.length === 1 ? "" : "s"}
                            </span>
                            {firstAssistantTurn && (
                              <span className="text-[11px] text-muted-foreground truncate" title={firstAssistantTurn}>
                                &quot;{firstAssistantTurn}&quot;
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Link
                            href={`/calls/${call.id}?workspace=${currentWorkspace}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "h-7 text-xs gap-1 cursor-pointer font-medium",
                            })}
                          >
                            <Eye className="size-3" />
                            View
                            <ArrowUpRight className="size-3 text-muted-foreground" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
