"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CalendarCheck,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Sparkles,
  Search,
  ExternalLink,
  Bot,
  CheckCircle2,
  TrendingUp,
  LayoutGrid,
  List,
  PhoneCall,
  Inbox,
  FileText,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { CallHistoryRecord } from "@/context/vapi-context"

function isMeetingBooked(call: CallHistoryRecord): boolean {
  const disp =
    call.disposition ||
    call.analysis?.structuredData?.disposition ||
    (call as any).structuredData?.disposition ||
    ""
  const norm = disp.toLowerCase().replace(/[\s-_]+/g, "_")
  return norm === "meeting_booked" || norm === "booked"
}

export function MeetingsView() {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || "legal"

  const storageKey = `omnireach_call_logs_${currentWorkspace}`

  const [allCalls, setAllCalls] = React.useState<CallHistoryRecord[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load all calls from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let loadedList: CallHistoryRecord[] = []
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          loadedList = JSON.parse(saved)
        } else {
          const defaultSaved = localStorage.getItem("omnireach_call_logs_default")
          loadedList = defaultSaved ? JSON.parse(defaultSaved) : []
        }
        setAllCalls(loadedList)
      } catch (err) {
        console.error("Error loading calls for meetings:", err)
        setAllCalls([])
      } finally {
        setIsLoaded(true)
      }
    }
  }, [currentWorkspace, storageKey])

  // Filter for Booked Meetings
  const bookedMeetings = React.useMemo(() => {
    return allCalls.filter((call) => isMeetingBooked(call))
  }, [allCalls])

  // Search filter
  const filteredMeetings = React.useMemo(() => {
    if (!searchQuery.trim()) return bookedMeetings
    const q = searchQuery.toLowerCase()
    return bookedMeetings.filter((call) => {
      const struct = call.analysis?.structuredData || (call as any).structuredData || {}
      const name = (struct.name || struct.clientName || struct.customerName || "").toLowerCase()
      const email = (struct.email || "").toLowerCase()
      const phone = (call.customerNumber || struct.phone || "").toLowerCase()
      const notes = (call.analysis?.summary || struct.notes || "").toLowerCase()
      const date = (struct.dateTime || struct.meetingTime || call.date).toLowerCase()
      const idMatch = String(call.id).toLowerCase()

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        notes.includes(q) ||
        date.includes(q) ||
        idMatch.includes(q)
      )
    })
  }, [bookedMeetings, searchQuery])

  const totalCalls = allCalls.length
  const totalBooked = bookedMeetings.length
  const bookingRate = totalCalls > 0 ? Math.round((totalBooked / totalCalls) * 100) : 0

  const workspaceLabel =
    currentWorkspace === "legal"
      ? "Legal Intake"
      : currentWorkspace === "dental"
      ? "Dental Clinic"
      : "General Outreach"

  if (!isMounted) return null

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Booked Meetings
            </h1>
            <Badge variant="outline" className="font-mono text-xs capitalize">
              <Sparkles className="size-3 text-primary mr-1" />
              Workspace: {workspaceLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Confirmed consultations and appointments scheduled via Vapi AI Voice Agent analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / Table Toggle */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              <LayoutGrid className="size-3.5" />
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              <List className="size-3.5" />
              Table
            </Button>
          </div>

          <Link
            href={`/vapi?workspace=${currentWorkspace}`}
            className={buttonVariants({ size: "sm", className: "gap-2 shadow-xs cursor-pointer" })}
          >
            <PhoneCall className="size-3.5" />
            Launch AI Outbound
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Booked Consultations
            </CardTitle>
            <CalendarCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalBooked}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Successfully scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Call-to-Meeting Rate
            </CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{bookingRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {totalBooked} of {totalCalls} completed sessions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Telephony Status
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Analysis Engine</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Automatic structured extraction active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by client name, email, phone, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* Content Rendering */}
      {!isLoaded ? (
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
          Loading booked meetings...
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card className="shadow-2xs">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="size-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-semibold text-foreground">
                {searchQuery ? "No matching meetings found" : "No Booked Meetings Yet"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchQuery
                  ? "Try searching with different keywords."
                  : "When your Vapi AI Assistant conducts a call and qualifies a lead for an appointment, the session disposition will mark as 'Meeting Booked' and appear here automatically."}
              </p>
            </div>
            {!searchQuery && (
              <Link
                href={`/vapi?workspace=${currentWorkspace}`}
                className={buttonVariants({ size: "sm", className: "mt-2 text-xs gap-1.5" })}
              >
                <PhoneCall className="size-3.5" />
                Start an AI Qualification Call
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* CSS Grid of Cards */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((call) => {
            const struct =
              call.analysis?.structuredData || (call as any).structuredData || {}
            const clientName =
              struct.name ||
              struct.clientName ||
              struct.customerName ||
              (call.customerNumber ? `Caller (${call.customerNumber})` : `Lead #${String(call.id).slice(-6)}`)
            const email = struct.email || null
            const phone = call.customerNumber || struct.phone || null
            const meetingDateTime =
              struct.dateTime || struct.meetingTime || struct.appointmentTime || call.date
            const summary =
              call.analysis?.summary ||
              struct.notes ||
              call.messages[call.messages.length - 1]?.text ||
              "Consultation details confirmed during voice session."

            return (
              <Card
                key={call.id}
                className="shadow-2xs hover:shadow-xs transition-shadow border-border/80 flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                        <User className="size-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {clientName}
                        </CardTitle>
                        <CardDescription className="text-[11px] font-mono mt-0.5">
                          Call #{String(call.id).slice(-8)}
                        </CardDescription>
                      </div>
                    </div>

                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-medium text-[10px] px-2 py-0.5 shadow-none shrink-0">
                      Confirmed
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3 flex-1 text-xs">
                  {/* Meeting Time */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
                    <Calendar className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block tracking-wider font-mono">
                        Scheduled Consultation
                      </span>
                      <span className="font-semibold text-xs text-foreground font-mono">
                        {meetingDateTime}
                      </span>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-1.5 pt-1">
                    {phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="size-3.5 text-primary shrink-0" />
                        <span className="font-mono text-[11px] text-foreground font-medium">
                          {phone}
                        </span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="size-3.5 text-primary shrink-0" />
                        <span className="text-[11px] text-foreground truncate">{email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[11px]">
                        Call Duration: <span className="font-mono font-medium">{call.duration}</span>
                      </span>
                    </div>
                  </div>

                  {/* Notes / Summary */}
                  {summary && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border text-[11px] text-muted-foreground line-clamp-2">
                      <span className="font-semibold text-foreground block mb-0.5 text-[10px] uppercase font-mono">
                        AI Summary:
                      </span>
                      {summary}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 pb-3 border-t flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px] capitalize">
                    {workspaceLabel}
                  </Badge>

                  <Link
                    href={`/calls/${call.id}?workspace=${currentWorkspace}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      className: "h-7 text-xs gap-1 text-primary hover:text-primary cursor-pointer font-medium p-0 hover:bg-transparent",
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
      ) : (
        /* Table View */
        <Card className="shadow-2xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Client Name</TableHead>
                  <TableHead>Scheduled Date/Time</TableHead>
                  <TableHead>Contact (Phone / Email)</TableHead>
                  <TableHead>Tenant Workspace</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map((call) => {
                  const struct =
                    call.analysis?.structuredData || (call as any).structuredData || {}
                  const clientName =
                    struct.name ||
                    struct.clientName ||
                    struct.customerName ||
                    (call.customerNumber ? `Caller (${call.customerNumber})` : `Lead #${String(call.id).slice(-6)}`)
                  const email = struct.email || null
                  const phone = call.customerNumber || struct.phone || "WebRTC"
                  const meetingDateTime =
                    struct.dateTime || struct.meetingTime || struct.appointmentTime || call.date

                  return (
                    <TableRow key={call.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-xs text-foreground">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-muted-foreground" />
                          <span>{clientName}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
                          <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{meetingDateTime}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-mono text-[11px] text-foreground font-medium flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" />
                            {phone}
                          </span>
                          {email && (
                            <span className="text-[10px] text-muted-foreground font-sans">
                              {email}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[11px] capitalize">
                          {workspaceLabel}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-medium text-[11px] px-2 py-0.5 shadow-none">
                          Confirmed
                        </Badge>
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
                          <FileText className="size-3" />
                          Transcript
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
