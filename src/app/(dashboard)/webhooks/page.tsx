import * as React from "react"
import { Webhook, Radio, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function WebhooksPage() {
  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Webhook Integrations
          </h1>
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 border-transparent font-medium text-xs">
            Live Listeners Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure inbound event listeners for cold email sequencing platforms and AI voice agents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Manyreach Webhook Card */}
        <Card className="shadow-2xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Webhook className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Manyreach Cold Email</CardTitle>
                  <CardDescription className="text-xs">Inbound replies, opens, and clicks</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Webhook Endpoint URL</span>
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-2.5 text-xs font-mono">
                <span className="truncate text-foreground">https://api.yourdomain.com/api/webhooks/manyreach</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Subscribed Events</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[11px]">email.replied</Badge>
                <Badge variant="secondary" className="text-[11px]">email.opened</Badge>
                <Badge variant="secondary" className="text-[11px]">email.bounced</Badge>
                <Badge variant="secondary" className="text-[11px]">sequence.completed</Badge>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
                <CheckCircle2 className="size-3.5 text-emerald-600" /> Signature Verification
              </div>
              Incoming payloads verified via HMAC SHA256 header.
            </div>
          </CardContent>
        </Card>

        {/* Vapi Voice Webhook Card */}
        <Card className="shadow-2xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Radio className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Vapi Voice Agent</CardTitle>
                  <CardDescription className="text-xs">Outbound AI phone calls & transcripts</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Webhook Endpoint URL</span>
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-2.5 text-xs font-mono">
                <span className="truncate text-foreground">https://api.yourdomain.com/api/webhooks/vapi</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Subscribed Events</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[11px]">call.completed</Badge>
                <Badge variant="secondary" className="text-[11px]">transcript.ready</Badge>
                <Badge variant="secondary" className="text-[11px]">booking.confirmed</Badge>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
                <CheckCircle2 className="size-3.5 text-emerald-600" /> Automatic Sync
              </div>
              Call recordings & transcripts automatically attach to lead timeline.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
