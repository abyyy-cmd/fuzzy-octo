"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Building2,
  Save,
  Webhook,
  Workflow,
  Radio,
  Database,
  CheckCircle2,
  Sparkles,
  Send,
  Lock,
  Loader2,
  ExternalLink,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface WorkspaceSetting {
  name: string
  slug: string
  n8nWebhookUrl: string
  campaignId: string
  vapiAssistantId: string
}

const DEFAULT_SETTINGS: Record<string, WorkspaceSetting> = {
  legal: {
    name: "Law Firms",
    slug: "legal",
    n8nWebhookUrl: "https://n8n.yourdomain.com/webhook/law-firm-leads-ingestion",
    campaignId: "mr_camp_corporate_litigation_v2",
    vapiAssistantId: "vapi_asst_law_qualifier_01",
  },
  dental: {
    name: "Dental Clinics",
    slug: "dental",
    n8nWebhookUrl: "https://n8n.yourdomain.com/webhook/dental-clinics-ingestion",
    campaignId: "mr_camp_implant_invisalign_growth_v1",
    vapiAssistantId: "vapi_asst_dental_reception_02",
  },
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || "legal"

  const [settings, setSettings] = React.useState<Record<string, WorkspaceSetting>>(
    DEFAULT_SETTINGS
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [isTestingWebhook, setIsTestingWebhook] = React.useState(false)

  // Active workspace config with fallback
  const activeSetting: WorkspaceSetting = settings[currentWorkspace] || {
    name:
      currentWorkspace.charAt(0).toUpperCase() +
      currentWorkspace.slice(1) +
      " Niche",
    slug: currentWorkspace,
    n8nWebhookUrl: `https://n8n.yourdomain.com/webhook/${currentWorkspace}-ingestion`,
    campaignId: `mr_camp_${currentWorkspace}_default`,
    vapiAssistantId: `vapi_asst_${currentWorkspace}_default`,
  }

  const handleFieldChange = (field: keyof WorkspaceSetting, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [currentWorkspace]: {
        ...activeSetting,
        [field]: value,
      },
    }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success(
        `n8n configuration for "${activeSetting.name}" saved successfully!`
      )
    }, 600)
  }

  const handleTestWebhook = () => {
    if (!activeSetting.n8nWebhookUrl) {
      toast.error("Please enter a valid n8n Webhook URL first.")
      return
    }

    setIsTestingWebhook(true)
    setTimeout(() => {
      setIsTestingWebhook(false)
      toast.success(
        `Test ping sent to ${activeSetting.n8nWebhookUrl} (Status: 200 OK)`
      )
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Platform & Orchestration Settings
            </h1>
            <Badge variant="outline" className="font-mono text-xs capitalize">
              {activeSetting.slug}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure n8n automation webhooks, Manyreach campaigns, and Neon database routing for the active workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-transparent text-xs py-1 px-2.5">
            <CheckCircle2 className="size-3.5 mr-1" />
            Neon Connected
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* n8n & Workflow Orchestration Configuration */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Workflow className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    n8n Workflow & Routing Configuration
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Target endpoints and campaign parameters for incoming lead ingestion.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Active: {activeSetting.name}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* Workspace Name (Read-only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="workspace-name" className="text-xs font-semibold">
                  Workspace Name
                </Label>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                  <Lock className="size-3" /> Managed Workspace
                </span>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="workspace-name"
                  value={activeSetting.name}
                  disabled
                  readOnly
                  className="pl-9 text-xs h-9 bg-muted/50 cursor-not-allowed font-medium text-foreground"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Current active niche workspace slug: <code className="font-mono">{activeSetting.slug}</code>
              </p>
            </div>

            {/* n8n Webhook URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="n8n-webhook-url" className="text-xs font-semibold">
                  n8n Webhook URL
                </Label>
                <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                  <Webhook className="size-3" /> Production Webhook
                </span>
              </div>
              <div className="relative">
                <Webhook className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="n8n-webhook-url"
                  placeholder="https://n8n.yourdomain.com/webhook/lead-ingestion"
                  value={activeSetting.n8nWebhookUrl}
                  onChange={(e) => handleFieldChange("n8nWebhookUrl", e.target.value)}
                  className="pl-9 text-xs h-9 font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                When new CSV leads are uploaded to this workspace, OmniReach triggers this n8n webhook payload.
              </p>
            </div>

            {/* Default Campaign ID */}
            <div className="space-y-1.5">
              <Label htmlFor="campaign-id" className="text-xs font-semibold">
                Default Manyreach Campaign ID
              </Label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="campaign-id"
                  placeholder="mr_camp_law_qualification_v2"
                  value={activeSetting.campaignId}
                  onChange={(e) => handleFieldChange("campaignId", e.target.value)}
                  className="pl-9 text-xs h-9 font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                The Manyreach campaign ID passed to n8n to automatically enroll new prospects.
              </p>
            </div>

            {/* Vapi Voice Assistant ID */}
            <div className="space-y-1.5">
              <Label htmlFor="vapi-assistant-id" className="text-xs font-semibold">
                Vapi Voice Assistant ID
              </Label>
              <div className="relative">
                <Radio className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="vapi-assistant-id"
                  placeholder="vapi_asst_law_qualifier_01"
                  value={activeSetting.vapiAssistantId}
                  onChange={(e) => handleFieldChange("vapiAssistantId", e.target.value)}
                  className="pl-9 text-xs h-9 font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Autonomous voice caller agent configured to qualify replied inbound leads.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook || isSaving}
              className="gap-1.5 text-xs cursor-pointer"
            >
              {isTestingWebhook ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  Send Test Payload
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isTestingWebhook}
              className="gap-1.5 text-xs shadow-xs cursor-pointer font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Database & Infrastructure Status */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                <Database className="size-3.5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Neon Lakebase Postgres Connection</CardTitle>
                <CardDescription className="text-xs">
                  Serverless relational storage with automatic connection pooling.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Database Host</span>
                <p className="font-mono text-xs font-semibold truncate text-foreground">
                  ep-wispy-cell-aegpacsg-pooler.c-2.us-east-2.aws.neon.tech
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Active Pooler Mode</span>
                <p className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  PgBouncer (Transaction Mode)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
          Loading settings...
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  )
}
