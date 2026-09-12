"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Phone,
  Calendar,
  MessageSquareText,
  Inbox,
  Loader2,
  FileText,
  Clock,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { getCategoryHeader, inferCallCategory } from "@/lib/call-categorization"

interface TranscriptLine {
  role?: string
  text?: string
  timestamp?: string
}

interface CallLogRecord {
  id: string
  workspaceId: string | null
  vapiCallId: string | null
  customerNumber: string | null
  callDirection: string | null
  duration: string | null
  callStatus: string | null
  callCategory?: string | null
  transcript: TranscriptLine[] | null
  summary: string | null
  createdAt: string | null
}

type CallStatus = "Converted" | "Not Converted" | "Unknown"

function normalizeStatus(raw?: string | null): CallStatus {
  const norm = (raw || "").toLowerCase().replace(/[\s-_]+/g, "_")
  if (norm === "converted") return "Converted"
  if (norm === "not_converted" || norm === "notconverted") return "Not Converted"
  return "Unknown"
}

function StatusBadge({ status }: { status: CallStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-[11px] px-2 py-0.5 shadow-none border",
        status === "Converted" &&
          "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        status === "Not Converted" &&
          "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        status === "Unknown" &&
          "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
      )}
    >
      {status}
    </Badge>
  )
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function CallHistoryTable({
  workspace,
}: {
  workspace?: string
}) {
  const searchParams = useSearchParams()
  const tenant = searchParams.get("tenant") || workspace || searchParams.get("workspace") || "legal"
  const currentWorkspace = workspace || searchParams.get("workspace") || searchParams.get("tenant") || "legal"

  // Dynamic header based on active tenant
  const categoryHeader = getCategoryHeader(tenant)

  const [logs, setLogs] = React.useState<CallLogRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedLog, setSelectedLog] = React.useState<CallLogRecord | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch(`/api/vapi/logs?workspace=${encodeURIComponent(currentWorkspace)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setLogs(Array.isArray(data.logs) ? data.logs : [])
      })
      .catch((err) => {
        if (cancelled) return
        console.error("Error loading call logs:", err)
        setError(err instanceof Error ? err.message : "Failed to load call logs")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentWorkspace])

  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Call History
            </CardTitle>
            <CardDescription className="text-xs">
              Recorded voice sessions for the{" "}
              <span className="font-mono capitalize">{currentWorkspace}</span>{" "}
              workspace
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs capitalize">
            {logs.length} record{logs.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Phone Number</TableHead>
              <TableHead>Date / Time</TableHead>
              <TableHead>{categoryHeader}</TableHead>
              <TableHead>Call Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading call logs...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-xs text-destructive">
                    <span>{error}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto py-8">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                      <Inbox className="size-6" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No calls recorded yet
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When a Vapi voice call completes, the transcript is saved
                      here for this workspace.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const status = normalizeStatus(log.callStatus)
                const transcriptLines = Array.isArray(log.transcript)
                  ? log.transcript
                  : []
                return (
                  <TableRow
                    key={log.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-foreground font-medium">
                        <Phone className="size-3 text-primary" />
                        {log.customerNumber || "—"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-foreground">
                        {inferCallCategory({ ...log, messages: log.transcript || [] }, currentWorkspace)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5 cursor-pointer font-medium"
                        onClick={() => setSelectedLog(log)}
                        disabled={transcriptLines.length === 0}
                      >
                        <MessageSquareText className="size-3" />
                        View Transcript
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      >
        {selectedLog && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 pr-6">
                <MessageSquareText className="size-4 text-primary" />
                Call Transcript
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="size-3" />
                  {selectedLog.customerNumber || "Unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDateTime(selectedLog.createdAt)}
                </span>
                {selectedLog.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {selectedLog.duration}
                  </span>
                )}
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
                  {categoryHeader}: {inferCallCategory({ ...selectedLog, messages: selectedLog.transcript || [] }, currentWorkspace)}
                </Badge>
                <StatusBadge status={normalizeStatus(selectedLog.callStatus)} />
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto rounded-lg border bg-muted/30">
              {Array.isArray(selectedLog.transcript) &&
              selectedLog.transcript.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {selectedLog.transcript.map((line, i) => {
                    const isAgent =
                      line.role === "assistant" || line.role === "agent"
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex gap-3 px-4 py-2.5",
                          isAgent ? "bg-background" : "bg-muted/40"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 shrink-0 rounded font-mono text-[10px] uppercase tracking-wide w-16 py-0.5 text-center",
                            isAgent
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          {isAgent ? "Agent" : "Customer"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                            {line.text || ""}
                          </p>
                          {line.timestamp && (
                            <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                              {line.timestamp}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
                  <FileText className="size-5" />
                  No transcript available for this call
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  )
}