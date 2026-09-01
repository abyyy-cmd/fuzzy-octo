"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Building2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const WORKSPACE_CONFIGS: Record<
  string,
  {
    name: string
    slug: string
    defaultCampaign: string
  }
> = {
  legal: {
    name: "Law Firms Niche",
    slug: "legal",
    defaultCampaign: "Corporate Case Qualification V2",
  },
  dental: {
    name: "Dental Clinics Niche",
    slug: "dental",
    defaultCampaign: "Dental Practice Patient Growth V1",
  },
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const currentWorkspace = searchParams.get("workspace") || "legal"

  const activeConfig = WORKSPACE_CONFIGS[currentWorkspace] || {
    name: `${currentWorkspace.charAt(0).toUpperCase() + currentWorkspace.slice(1)} Niche`,
    slug: currentWorkspace,
    defaultCampaign: "Default Outreach Campaign V1",
  }

  return (
    <div className="flex-1 space-y-6 p-6 overflow-y-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Neon database connections and workspace preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Multi-Tenant Workspace Configuration */}
        <Card className="shadow-2xs">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <Building2 className="size-4 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Workspace Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Configure default routing and niche boundaries for incoming lead uploads.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3.5 space-y-1.5 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{activeConfig.name}</span>
                <span className="text-xs font-mono text-muted-foreground">slug: {activeConfig.slug}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Default campaign: &quot;{activeConfig.defaultCampaign}&quot;
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="gap-2 shadow-xs cursor-pointer">
            <Save className="size-4" />
            Save Changes
          </Button>
        </div>
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


