"use client"

import * as React from "react"
import Vapi from "@vapi-ai/web"
import { toast } from "sonner"

// Bulletproof Singleton: Instantiate Vapi once outside of the React lifecycle
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "placeholder-key")

export interface TranscriptMessage {
  id?: string
  role: "assistant" | "user" | "system" | string
  text: string
  isPartial?: boolean
  timestamp?: string
}

export interface CallAnalysis {
  summary?: string
  structuredData?: {
    disposition?: "meeting_booked" | "not_booked" | "incomplete" | string
    [key: string]: any
  }
  [key: string]: any
}

export interface CallHistoryRecord {
  id: number | string
  vapiCallId?: string
  recordingUrl?: string
  customerNumber?: string
  disposition?: "meeting_booked" | "not_booked" | "incomplete" | string
  analysis?: CallAnalysis
  date: string
  duration: string
  direction?: "Outbound" | "Inbound"
  messages: TranscriptMessage[]
}

export interface VapiContextType {
  isCallActive: boolean
  isConnecting: boolean
  isMuted: boolean
  callDirection: "Outbound" | "Inbound"
  customerNumber: string | undefined
  transcripts: TranscriptMessage[]
  callDuration: number
  activeWorkspace: string | undefined
  currentVapiCallId: string | undefined
  startCall: (
    assistantId?: string,
    workspaceId?: string,
    direction?: "Outbound" | "Inbound",
    callerNumber?: string
  ) => Promise<void>
  endCall: () => void
  toggleMute: () => void
  clearTranscripts: () => void
  setCallDirection: (dir: "Outbound" | "Inbound") => void
  setCustomerNumber: (num?: string) => void
  formatTime: (seconds: number) => string
}

const VapiContext = React.createContext<VapiContextType | null>(null)

export function VapiProvider({ children }: { children: React.ReactNode }) {
  const [isCallActive, setIsCallActive] = React.useState<boolean>(false)
  const [isConnecting, setIsConnecting] = React.useState<boolean>(false)
  const [isMuted, setIsMuted] = React.useState<boolean>(false)
  const [callDirection, setCallDirection] = React.useState<"Outbound" | "Inbound">("Outbound")
  const [customerNumber, setCustomerNumber] = React.useState<string | undefined>(undefined)
  const [transcripts, setTranscripts] = React.useState<TranscriptMessage[]>([])
  const [callDuration, setCallDuration] = React.useState<number>(0)
  const [activeWorkspace, setActiveWorkspace] = React.useState<string | undefined>("legal")
  const [currentVapiCallId, setCurrentVapiCallId] = React.useState<string | undefined>(undefined)

  // Refs for accessing latest values inside event callbacks without stale closures
  const transcriptsRef = React.useRef<TranscriptMessage[]>(transcripts)
  transcriptsRef.current = transcripts

  const callDurationRef = React.useRef<number>(callDuration)
  callDurationRef.current = callDuration

  const callDirectionRef = React.useRef<"Outbound" | "Inbound">(callDirection)
  callDirectionRef.current = callDirection

  const customerNumberRef = React.useRef<string | undefined>(customerNumber)
  customerNumberRef.current = customerNumber

  const activeWorkspaceRef = React.useRef<string | undefined>(activeWorkspace)
  activeWorkspaceRef.current = activeWorkspace

  const currentVapiCallIdRef = React.useRef<string | undefined>(currentVapiCallId)
  currentVapiCallIdRef.current = currentVapiCallId

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Call duration counter
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  // Bind Vapi events globally — NOTE: Cleanup only unbinds listeners, DOES NOT call vapi.stop()
  React.useEffect(() => {
    const handleCallStart = (call?: any) => {
      setTranscripts([])
      setCallDuration(0)
      setIsCallActive(true)
      setIsConnecting(false)

      const callId = call?.id || call?.callId
      if (callId) {
        setCurrentVapiCallId(callId)
      }

      const phoneNum =
        call?.customer?.number ||
        call?.phoneNumber ||
        call?.customer?.phoneNumber ||
        call?.phone
      if (phoneNum) {
        setCustomerNumber(phoneNum)
        customerNumberRef.current = phoneNum
      }

      toast.success("Voice call connected")
    }

    const handleCallEnd = () => {
      const activeTranscripts = transcriptsRef.current
      const currentDuration = callDurationRef.current
      const currentDir = callDirectionRef.current
      const currentPhone = customerNumberRef.current
      const ws = activeWorkspaceRef.current || "default"
      const storageKey = `omnireach_call_logs_${ws}`
      const vapiCallId = currentVapiCallIdRef.current

      // Archive completed call to workspace localStorage
      if (activeTranscripts && activeTranscripts.length > 0) {
        if (typeof window !== "undefined") {
          try {
            const saved = localStorage.getItem(storageKey)
            const existing: CallHistoryRecord[] = saved ? JSON.parse(saved) : []
            const newRecord: CallHistoryRecord = {
              id: Date.now(),
              vapiCallId: vapiCallId || undefined,
              recordingUrl: undefined, // Populated via Vapi REST API / Webhooks
              customerNumber: currentPhone || undefined,
              date: new Date().toLocaleDateString(),
              duration: formatTime(currentDuration),
              direction: currentDir,
              messages: activeTranscripts,
            }
            localStorage.setItem(storageKey, JSON.stringify([newRecord, ...existing]))
          } catch (e) {
            console.error("Error archiving call log:", e)
          }
        }
      }

      setIsCallActive(false)
      setIsConnecting(false)
      setIsMuted(false)
      setCurrentVapiCallId(undefined)
      setCustomerNumber(undefined)
      toast.info("Voice call ended")
    }

    const handleSpeechStart = () => {
      // AI or User started speaking
    }

    const handleSpeechEnd = () => {
      // Finished speaking
    }

    const handleMessage = (message: any) => {
      // Check for caller customer metadata
      if (message.type === "metadata" || message.call || message.customer) {
        const detectedPhone =
          message.call?.customer?.number ||
          message.customer?.number ||
          message.phoneNumber ||
          message.call?.phoneNumber
        if (detectedPhone) {
          setCustomerNumber(detectedPhone)
          customerNumberRef.current = detectedPhone
        }
      }

      if (message.type === "transcript" && message.transcript) {
        setTranscripts((prev) => {
          const isPartial = message.transcriptType === "partial"
          const lastMsg = prev[prev.length - 1]

          if (lastMsg && lastMsg.role === message.role && lastMsg.isPartial) {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...lastMsg,
              text: message.transcript,
              isPartial: isPartial,
            }
            return updated
          }

          return [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              role: message.role || "assistant",
              text: message.transcript,
              isPartial: isPartial,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]
        })
      }
    }

    const handleError = (error: any) => {
      console.error("Vapi Global Error:", error)
      setIsConnecting(false)
      setIsCallActive(false)
      const errorMsg =
        error?.message || error?.errorMsg || "Voice agent connection error"
      toast.error(`Vapi: ${errorMsg}`)
    }

    vapi.on("call-start", handleCallStart)
    vapi.on("call-end", handleCallEnd)
    vapi.on("speech-start", handleSpeechStart)
    vapi.on("speech-end", handleSpeechEnd)
    vapi.on("message", handleMessage)
    vapi.on("error", handleError)

    return () => {
      // Unbind event listeners only — DO NOT terminate active WebRTC session on unmount
      vapi.off("call-start", handleCallStart)
      vapi.off("call-end", handleCallEnd)
      vapi.off("speech-start", handleSpeechStart)
      vapi.off("speech-end", handleSpeechEnd)
      vapi.off("message", handleMessage)
      vapi.off("error", handleError)
    }
  }, [])

  const startCall = async (
    assistantId?: string,
    workspaceId?: string,
    direction: "Outbound" | "Inbound" = "Outbound",
    callerNumber?: string
  ) => {
    if (isConnecting || isCallActive) return

    setCallDirection(direction)
    if (callerNumber) {
      setCustomerNumber(callerNumber)
      customerNumberRef.current = callerNumber
    }

    if (workspaceId) {
      setActiveWorkspace(workspaceId)
    }

    try {
      setIsConnecting(true)

      const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
      if (!apiKey || apiKey === "placeholder-key") {
        toast.info("Connecting demo voice session with placeholder configuration...")
      }

      // Resolve Assistant ID
      let resolvedId = assistantId
      if (!resolvedId) {
        const ws = workspaceId || activeWorkspace
        if (ws === "legal" && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_LEGAL) {
          resolvedId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_LEGAL
        } else if (ws === "dental" && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_DENTAL) {
          resolvedId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_DENTAL
        } else {
          resolvedId =
            process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "vapi-default-assistant"
        }
      }

      const callResult: any = await vapi.start(resolvedId)
      if (callResult?.id) {
        setCurrentVapiCallId(callResult.id)
      }
      const customerNum =
        callResult?.customer?.number ||
        callResult?.phoneNumber ||
        callResult?.customer?.phoneNumber
      if (customerNum) {
        setCustomerNumber(customerNum)
        customerNumberRef.current = customerNum
      }
    } catch (err) {
      console.error("Failed to start Vapi call:", err)
      setIsConnecting(false)
      setIsCallActive(false)
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to initialize WebRTC call. Check your microphone permissions."
      )
    }
  }

  const endCall = () => {
    try {
      vapi.stop()
    } catch (err) {
      console.error("Failed to stop Vapi call:", err)
      setIsCallActive(false)
      setIsConnecting(false)
    }
  }

  const toggleMute = () => {
    try {
      const nextMuted = !isMuted
      vapi.setMuted(nextMuted)
      setIsMuted(nextMuted)
      toast.info(nextMuted ? "Microphone muted" : "Microphone unmuted")
    } catch (err) {
      console.error("Failed to toggle mute:", err)
    }
  }

  const clearTranscripts = () => {
    setTranscripts([])
    toast.info("Transcripts cleared")
  }

  return (
    <VapiContext.Provider
      value={{
        isCallActive,
        isConnecting,
        isMuted,
        callDirection,
        customerNumber,
        transcripts,
        callDuration,
        activeWorkspace,
        currentVapiCallId,
        startCall,
        endCall,
        toggleMute,
        clearTranscripts,
        setCallDirection,
        setCustomerNumber,
        formatTime,
      }}
    >
      {children}
    </VapiContext.Provider>
  )
}

export const useVapi = (): VapiContextType => {
  const context = React.useContext(VapiContext)
  if (!context) {
    throw new Error("useVapi must be used within a VapiProvider")
  }
  return context
}
