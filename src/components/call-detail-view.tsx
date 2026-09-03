"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Phone,
  Clock,
  Calendar,
  Copy,
  Check,
  Bot,
  User,
  Sparkles,
  Download,
  Share2,
  Inbox,
  Radio,
  FileText,
  Volume2,
  VolumeX,
  Play,
  Loader2,
  RefreshCw,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CallHistoryRecord, TranscriptMessage } from "@/context/vapi-context"

interface CallDetailViewProps {
  id: string
  initialWorkspace?: string
}

export function CallDetailView({ id, initialWorkspace }: CallDetailViewProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || initialWorkspace || "legal"

  const [call, setCall] = React.useState<CallHistoryRecord | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isFetchingRecording, setIsFetchingRecording] = React.useState(false)

  // Load call from localStorage matching ID
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // First check the current workspace's storage
        const storageKey = `omnireach_call_logs_${currentWorkspace}`
        const saved = localStorage.getItem(storageKey)
        let found: CallHistoryRecord | undefined

        if (saved) {
          const list: CallHistoryRecord[] = JSON.parse(saved)
          found = list.find((c) => String(c.id) === String(id))
        }

        // If not found in current workspace, search other workspace storage keys
        if (!found) {
          const allKeys = Object.keys(localStorage).filter((k) =>
            k.startsWith("omnireach_call_logs")
          )
          for (const key of allKeys) {
            try {
              const items: CallHistoryRecord[] = JSON.parse(
                localStorage.getItem(key) || "[]"
              )
              const match = items.find((c) => String(c.id) === String(id))
              if (match) {
                found = match
                break
              }
            } catch {}
          }
        }

        setCall(found || null)
      } catch (err) {
        console.error("Error retrieving call details:", err)
      } finally {
        setIsLoaded(true)
      }
    }
  }, [id, currentWorkspace])

  const storageKey = `omnireach_call_logs_${currentWorkspace}`

  // Polling mechanism: repeatedly checks backend API every 5s until the secure recordingUrl is ready
  React.useEffect(() => {
    if (!call || !call.vapiCallId || call.recordingUrl) return

    let isMounted = true

    const checkRecording = async (manual = false) => {
      try {
        setIsFetchingRecording(true)
        const res = await fetch(`/api/vapi/recording?callId=${encodeURIComponent(call.vapiCallId!)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.recordingUrl && isMounted) {
            // 1. Instantly update the UI
            setCall((prev) => (prev ? { ...prev, recordingUrl: data.recordingUrl } : prev))

            // 2. Permanently save to localStorage so it survives page refreshes
            if (typeof window !== "undefined") {
              const history = JSON.parse(localStorage.getItem(storageKey) || "[]")
              const updatedHistory = history.map((c: any) =>
                c.id === call.id || String(c.id) === String(call.id) || (c.vapiCallId && c.vapiCallId === call.vapiCallId)
                  ? { ...c, recordingUrl: data.recordingUrl }
                  : c
              )
              localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
            }

            toast.success("Call audio recording is now ready")
          } else if (manual) {
            toast.info("Recording is still processing on Vapi telephony servers. Polling will keep checking.")
          }
        } else if (manual) {
          toast.error("Recording not yet available on Vapi servers.")
        }
      } catch (error) {
        console.error("Failed to fetch recording:", error)
      } finally {
        if (isMounted) {
          setIsFetchingRecording(false)
        }
      }
    }

    // Check immediately, then every 5 seconds
    checkRecording()
    const intervalId = setInterval(checkRecording, 5000)

    // Cleanup interval when the component unmounts or URL is found
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [call?.vapiCallId, call?.recordingUrl, storageKey, call?.id])

  const handleManualRefresh = async () => {
    if (!call?.vapiCallId || isFetchingRecording) return
    try {
      setIsFetchingRecording(true)
      const res = await fetch(`/api/vapi/recording?callId=${encodeURIComponent(call.vapiCallId)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.recordingUrl) {
          setCall((prev) => (prev ? { ...prev, recordingUrl: data.recordingUrl } : prev))

          if (typeof window !== "undefined") {
            const history = JSON.parse(localStorage.getItem(storageKey) || "[]")
            const updatedHistory = history.map((c: any) =>
              c.id === call.id || String(c.id) === String(call.id) || (c.vapiCallId && c.vapiCallId === call.vapiCallId)
                ? { ...c, recordingUrl: data.recordingUrl }
                : c
            )
            localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
          }

          toast.success("Call audio recording is now ready")
        } else {
          toast.info("Recording is still processing on Vapi telephony servers.")
        }
      } else {
        toast.error("Recording not yet available on Vapi servers.")
      }
    } catch (err) {
      console.error("Failed to fetch recording:", err)
    } finally {
      setIsFetchingRecording(false)
    }
  }

  const handleCopyTranscript = () => {
    if (!call) return
    const text = call.messages
      .map(
        (m) =>
          `[${m.timestamp || call.date}] ${m.role === "assistant" ? "Vapi Agent" : "User"}: ${m.text}`
      )
      .join("\n")

    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Full transcript copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportJson = () => {
    if (!call) return
    const blob = new Blob([JSON.stringify(call, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vapi_call_${id}_transcript.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Exported transcript as JSON")
  }

  const workspaceLabel =
    currentWorkspace === "legal"
      ? "Legal Intake"
      : currentWorkspace === "dental"
      ? "Dental Clinic"
      : "General Outreach"

  if (!isMounted) return null

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-muted-foreground">
        Loading call details...
      </div>
    )
  }

  if (!call) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Call Record Not Found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Could not find recording or transcript metadata for call ID &quot;{id}&quot;. It may have been cleared from local storage.
          </p>
        </div>
        <Link
          href={`/calls?workspace=${currentWorkspace}`}
          className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs" })}
        >
          <ArrowLeft className="size-3.5" />
          Back to Call History
        </Link>
      </div>
    )
  }

  const startTime = call.messages[0]?.timestamp || "Recorded"
  const lastTime = call.messages[call.messages.length - 1]?.timestamp || "Ended"

  console.log("UI Audio Source:", call?.recordingUrl)

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto max-w-5xl">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={`/calls?workspace=${currentWorkspace}`}
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-2 cursor-pointer" })}
        >
          <ArrowLeft className="size-4" />
          Back to Call History
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTranscript}
            className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy Transcript
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
          >
            <Download className="size-3.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Call Metadata Header Card */}
      <Card className="shadow-2xs border-border/80">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg font-bold">
                    Voice Session #{String(id).slice(-8)}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs"
                  >
                    Ended
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs capitalize">
                    <Sparkles className="size-3 text-primary mr-1" />
                    {workspaceLabel}
                  </Badge>
                  {call.vapiCallId && (
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                      Vapi ID: {call.vapiCallId.slice(0, 8)}...
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Complete speech-to-text transcript and session diagnostics
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Session Duration</span>
                <span className="text-sm font-bold font-mono text-foreground flex items-center gap-1 justify-end">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {call.duration}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <span className="text-muted-foreground block">Caller Details</span>
            <div className="space-y-0.5">
              <span className="font-mono font-semibold text-foreground flex items-center gap-1">
                <Phone className="size-3.5 text-primary" />
                {call.customerNumber || "WebRTC Client"}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {call.customerNumber ? "Inbound Telephony (Unknown Lead)" : "Browser Direct Audio"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <span className="text-muted-foreground block">Date</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Calendar className="size-3.5 text-muted-foreground" />
              {call.date}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <span className="text-muted-foreground block">Start Time</span>
            <span className="font-mono font-semibold text-foreground">
              {startTime}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <span className="text-muted-foreground block">End Time</span>
            <span className="font-mono font-semibold text-foreground">
              {lastTime}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
            <span className="text-muted-foreground block">Dialogue Turns</span>
            <span className="font-mono font-semibold text-foreground flex items-center gap-1">
              <FileText className="size-3.5 text-muted-foreground" />
              {call.messages.length} messages
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Call Audio Recording Playback Card */}
      <Card className="shadow-2xs border-border/80">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Volume2 className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Call Audio Recording</CardTitle>
                <CardDescription className="text-xs">
                  {call.recordingUrl
                    ? "Full stereo audio playback from Vapi AI telephony/WebRTC stream"
                    : "Stereo audio stream recording rendered by Vapi telephony servers"}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {call.vapiCallId && !call.recordingUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isFetchingRecording}
                  className="h-7 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`size-3 ${isFetchingRecording ? "animate-spin" : ""}`} />
                  {isFetchingRecording ? "Checking..." : "Refresh Recording"}
                </Button>
              )}

              {call.recordingUrl ? (
                <Badge className="bg-emerald-600 text-white font-mono text-[11px] px-2 py-0.5">
                  ● Available
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300 font-mono text-[11px] px-2 py-0.5">
                  <Loader2 className="size-3 animate-spin mr-1" />
                  <span className="animate-pulse">Recording Processing...</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {call?.recordingUrl ? (
            <div className="space-y-2">
              <audio
                key={call.recordingUrl}
                controls
                src={call.recordingUrl}
                className="w-full h-12 outline-none rounded-md"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>Format: MP3 Audio / Stereo Telephony Stream</span>
                <span>Session #{String(id).slice(-8)}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <VolumeX className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    <span className="animate-pulse">Recording Processing...</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {call.vapiCallId
                      ? `Vapi Call ID: ${call.vapiCallId}. Recording URL will be fetched automatically.`
                      : "Recording URL will be populated via Vapi API once audio file rendering concludes."}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isFetchingRecording || !call.vapiCallId}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`size-3 ${isFetchingRecording ? "animate-spin" : ""}`} />
                {isFetchingRecording ? "Checking..." : "Check Status"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation Dialogue Transcript View */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Conversation Transcript
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[11px]">
                {call.messages.length} turns
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Vapi WebRTC Audio
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 max-h-[540px] overflow-y-auto">
          {call.messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No transcript records available for this call.
            </div>
          ) : (
            call.messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant"

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-3 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      <Bot className="size-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl p-3.5 shadow-2xs space-y-1.5 ${
                      isAssistant
                        ? "bg-card border text-card-foreground"
                        : "bg-primary text-primary-foreground ml-auto"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[11px] opacity-75 font-mono">
                      <span className="font-semibold capitalize">
                        {isAssistant ? "Vapi Voice Assistant" : "User"}
                      </span>
                      {msg.timestamp && <span>{msg.timestamp}</span>}
                    </div>
                    <p className="leading-relaxed text-xs break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>

                  {!isAssistant && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold">
                      <User className="size-3.5" />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </CardContent>

        <CardFooter className="py-3 px-6 border-t bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>{call.messages.length} total messages recorded</span>
          <span className="font-mono text-[11px]">Vapi Speech Engine</span>
        </CardFooter>
      </Card>
    </div>
  )
}
