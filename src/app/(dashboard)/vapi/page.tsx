import * as React from "react"
import { VapiCaller } from "@/components/vapi-caller"
import { Badge } from "@/components/ui/badge"
import { Radio } from "lucide-react"

interface VapiAssistantPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VapiAssistantPage({
  searchParams,
}: VapiAssistantPageProps) {
  const resolvedParams = await searchParams
  const workspaceId = (resolvedParams?.workspace as string) || "default"

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AI Voice Assistant
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-transparent text-xs py-1 px-2.5">
              <Radio className="size-3.5 mr-1" />
              WebRTC Active
            </Badge>
            {workspaceId !== "default" && (
              <Badge variant="outline" className="font-mono text-xs capitalize">
                Workspace: {workspaceId}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Conduct live, browser-based AI voice qualification calls and view real-time audio transcriptions.
          </p>
        </div>
      </div>

      {/* Main Interactive Vapi Caller Card */}
      <React.Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-12 text-xs text-muted-foreground">
            Initializing Vapi AI voice caller...
          </div>
        }
      >
        <VapiCaller workspaceId={workspaceId} />
      </React.Suspense>
    </div>
  )
}
