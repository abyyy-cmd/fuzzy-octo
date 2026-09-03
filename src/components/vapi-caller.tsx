"use client"

import * as React from "react"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Bot,
  User,
  Radio,
  Trash2,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useVapi } from "@/context/vapi-context"

export interface VapiCallerProps {
  workspaceId?: string
  assistantId?: string
  title?: string
  description?: string
  className?: string
}

export function VapiCaller({
  workspaceId,
  assistantId,
  title = "Vapi AI Voice Agent",
  description = "Real-time browser WebRTC voice calling with AI lead qualification",
  className,
}: VapiCallerProps) {
  const {
    isCallActive,
    isConnecting,
    isMuted,
    transcripts,
    callDuration,
    startCall,
    endCall,
    toggleMute,
    clearTranscripts,
    formatTime,
  } = useVapi()

  // Dynamically select Assistant ID based on active workspace
  const targetAssistantId = React.useMemo(() => {
    if (workspaceId === "legal" && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_LEGAL) {
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_LEGAL
    }
    if (workspaceId === "dental" && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_DENTAL) {
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_DENTAL
    }
    return (
      assistantId ||
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ||
      "vapi-default-assistant"
    )
  }, [workspaceId, assistantId])

  const transcriptScrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of transcripts
  React.useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop =
        transcriptScrollRef.current.scrollHeight
    }
  }, [transcripts])

  const handleStartCall = async () => {
    await startCall(targetAssistantId, workspaceId)
  }

  return (
    <Card className={`shadow-sm border-border/80 flex flex-col ${className || ""}`}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                isCallActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 animate-pulse"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isCallActive ? (
                <Radio className="size-4 animate-spin" />
              ) : (
                <Bot className="size-4" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCallActive ? (
              <Badge className="bg-emerald-500 text-white font-mono text-xs px-2.5 py-0.5 animate-pulse">
                ● LIVE {formatTime(callDuration)}
              </Badge>
            ) : isConnecting ? (
              <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs px-2">
                <Loader2 className="size-3 animate-spin mr-1" />
                Connecting...
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Ready
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 flex-1 flex flex-col">
        {/* Call Controls Banner */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border">
          <div className="flex items-center gap-3">
            {isCallActive ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={endCall}
                className="gap-2 shadow-xs cursor-pointer font-medium"
              >
                <PhoneOff className="size-4" />
                End Call
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleStartCall}
                disabled={isConnecting}
                className="gap-2 shadow-xs cursor-pointer font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="size-4" />
                    Start Call
                  </>
                )}
              </Button>
            )}

            {isCallActive && (
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
                className="gap-1.5 text-xs cursor-pointer"
              >
                {isMuted ? (
                  <>
                    <MicOff className="size-3.5" />
                    Muted
                  </>
                ) : (
                  <>
                    <Mic className="size-3.5" />
                    Mute
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {transcripts.length > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={clearTranscripts}
                title="Clear transcripts"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Live Conversation Transcripts View */}
        <div className="flex flex-col flex-1 min-h-[220px] max-h-[320px]">
          <div className="flex items-center justify-between pb-2 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Volume2 className="size-3.5 text-primary" /> Live Transcription
            </span>
            <span className="text-[11px] font-mono">
              {transcripts.length} message{transcripts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div
            ref={transcriptScrollRef}
            className="flex-1 overflow-y-auto space-y-2.5 p-3 rounded-xl border bg-muted/20 text-xs"
          >
            {transcripts.length === 0 ? (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 text-muted-foreground space-y-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/5 text-muted-foreground">
                  <Sparkles className="size-4.5" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  No active conversation
                </p>
                <p className="text-[11px] max-w-xs text-muted-foreground">
                  Click <span className="font-semibold text-foreground">&quot;Start Call&quot;</span> above to initiate the live WebRTC stream with the voice agent.
                </p>
              </div>
            ) : (
              transcripts.map((item, idx) => {
                const isAssistant = item.role === "assistant"
                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-start gap-2.5 ${
                      isAssistant ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                        <Bot className="size-3" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-lg p-2.5 shadow-2xs space-y-1 ${
                        isAssistant
                          ? "bg-card border text-card-foreground"
                          : "bg-primary text-primary-foreground ml-auto"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 font-mono">
                        <span className="font-semibold capitalize">
                          {isAssistant ? "Vapi Agent" : "You"}
                        </span>
                        {item.timestamp && <span>{item.timestamp}</span>}
                      </div>
                      <p className="leading-relaxed text-xs break-words">
                        {item.text}
                      </p>
                    </div>

                    {!isAssistant && (
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground text-[10px] font-bold">
                        <User className="size-3" />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-3 px-6 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Powered by Vapi AI WebRTC</span>
        <span className="font-mono text-[10px]">Global WebRTC Context</span>
      </CardFooter>
    </Card>
  )
}
