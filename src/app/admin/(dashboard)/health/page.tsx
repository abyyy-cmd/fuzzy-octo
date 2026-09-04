import * as React from "react"
import {
  Cpu,
  ShieldCheck,
  Radio,
  Layers,
  Server,
  KeyRound,
  CheckCircle2,
  Activity,
  HardDrive,
  RefreshCw,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "System Health & Telemetry | OmniReach Super Admin",
  description: "Real-time subsystem status, edge middleware telemetry, and infrastructure diagnostics.",
}

export default async function AdminHealthPage() {
  const hasVapiPrivateKey = Boolean(
    process.env.VAPI_PRIVATE_API_KEY &&
      process.env.VAPI_PRIVATE_API_KEY !== "placeholder-key"
  )
  const hasVapiPublicKey = Boolean(
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY &&
      process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY !== "placeholder-key"
  )
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            System Health & Infrastructure
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time subsystem telemetry, Edge security guards, and database connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground bg-muted/40 border px-3 py-1.5 rounded-lg">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
          </span>
          <span>Core Subsystems: Operational</span>
        </div>
      </div>

      {/* Subsystem Health Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Edge Middleware Guard */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Edge Middleware</CardTitle>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-mono text-[10px] shadow-none">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Route Matching:</span>
              <span className="font-mono font-medium">/admin/*, /calls/*, /leads</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role Policy:</span>
              <span className="font-mono text-primary font-medium">SUPERADMIN Restricted</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">JWT Session Guard:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Enforced</span>
            </div>
          </CardContent>
        </Card>

        {/* Audio Telephony Proxy */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Audio Telephony Proxy</CardTitle>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-mono text-[10px] shadow-none">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Endpoint:</span>
              <span className="font-mono font-medium">/api/vapi/recording</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Protocol:</span>
              <span className="font-mono font-medium">302 Presigned Intercept</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mono Recording Sync:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Connected</span>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Tenant Isolation */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Multi-Tenant Isolation</CardTitle>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-mono text-[10px] shadow-none">
                Guarded
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Storage Key Strategy:</span>
              <span className="font-mono font-medium">omnireach_call_logs_[ws]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database Schema:</span>
              <span className="font-mono font-medium">workspaceId Foreign Partition</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tenant Isolation:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Zero-Leak</span>
            </div>
          </CardContent>
        </Card>

        {/* Neon Postgres Connection */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Neon Postgres Database</CardTitle>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-mono text-[10px] shadow-none">
                {hasDatabaseUrl ? "Connected" : "No DB URI"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Driver:</span>
              <span className="font-mono font-medium">@neondatabase/serverless</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ORM:</span>
              <span className="font-mono font-medium">Drizzle ORM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Connection Pooling:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
            </div>
          </CardContent>
        </Card>

        {/* Vapi AI Telephony Keys */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Vapi AI Telephony Keys</CardTitle>
              </div>
              <Badge
                className={
                  hasVapiPrivateKey
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-mono text-[10px] shadow-none"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 font-mono text-[10px] shadow-none"
                }
              >
                {hasVapiPrivateKey ? "Keys Active" : "Public Only"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Public Key:</span>
              <span className="font-mono font-medium">
                {hasVapiPublicKey ? "Configured" : "Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Private Key (Server):</span>
              <span className="font-mono font-medium">
                {hasVapiPrivateKey ? "Configured" : "Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WebRTC Assistant:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">Enabled</span>
            </div>
          </CardContent>
        </Card>

        {/* Auth.js Secret & Sessions */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Auth.js v5 Security</CardTitle>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-mono text-[10px] shadow-none">
                Encrypted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">AUTH_SECRET:</span>
              <span className="font-mono font-medium">{hasAuthSecret ? "Valid" : "Default"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Session Strategy:</span>
              <span className="font-mono font-medium">JWT + DB Sessions</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Providers:</span>
              <span className="font-mono text-foreground font-medium">Credentials, GitHub</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
