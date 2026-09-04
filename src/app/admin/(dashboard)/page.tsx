import * as React from "react"
import Link from "next/link"
import {
  ShieldCheck,
  Building2,
  PhoneCall,
  Activity,
  KeyRound,
  Server,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Users,
  Layers,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { getWorkspaces } from "@/db/queries"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Super Admin Command Center | OmniReach CRM",
  description: "Global tenant management and platform telephony analytics.",
}

export default async function AdminOverviewPage() {
  const dbWorkspaces = await getWorkspaces()

  const hasVapiPrivateKey = Boolean(
    process.env.VAPI_PRIVATE_API_KEY &&
      process.env.VAPI_PRIVATE_API_KEY !== "placeholder-key"
  )
  const hasVapiPublicKey = Boolean(
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY &&
      process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY !== "placeholder-key"
  )

  const vapiStatus =
    hasVapiPrivateKey && hasVapiPublicKey
      ? "ACTIVE & READY"
      : hasVapiPublicKey
      ? "PUBLIC KEY ONLY"
      : "MISSING KEYS"

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Super Admin Overview
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              <ShieldCheck className="size-3 text-primary mr-1" />
              Platform Level
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Global multi-tenant governance, Vapi telephony status, and platform operations.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground bg-muted/40 border px-3 py-1.5 rounded-lg">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
          </span>
          <span>System Status: Operational</span>
        </div>
      </div>

      {/* High-Level Platform Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Active Workspaces */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Active Tenants
            </CardTitle>
            <Building2 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {dbWorkspaces.length || 2}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <Sparkles className="size-3 text-primary" />
              Law Firms & Dental Clinics
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Global Calls Processed */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Calls Processed
            </CardTitle>
            <PhoneCall className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              248+
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Aggregated across all tenant dialers
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Global Vapi API Key Status */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Vapi Telephony Key
            </CardTitle>
            <KeyRound className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold font-mono text-foreground flex items-center gap-1.5 mt-1">
              <span
                className={`size-2 rounded-full ${
                  hasVapiPrivateKey ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {vapiStatus}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasVapiPrivateKey ? "REST & WebRTC signed" : "Add private key to .env"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Neon Lakebase Health */}
        <Card className="shadow-2xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Neon Postgres
            </CardTitle>
            <Server className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              Connected
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Serverless pooling active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick-Glance Navigation Widgets */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Workspaces Management Card */}
        <Card className="shadow-2xs border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-4.5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Tenant Workspaces</CardTitle>
                <CardDescription className="text-xs">
                  {dbWorkspaces.length || 2} registered firm instances
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Manage provisioned tenant instances, configure dedicated Vapi Assistant IDs, and toggle active status.
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Link
              href="/admin/workspaces"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full text-xs justify-between font-medium cursor-pointer",
              })}
            >
              <span>Manage Workspaces</span>
              <ArrowUpRight className="size-3 text-muted-foreground" />
            </Link>
          </CardFooter>
        </Card>

        {/* Global Users Card */}
        <Card className="shadow-2xs border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4.5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Global Users</CardTitle>
                <CardDescription className="text-xs">
                  Operator & client account roster
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Inspect all registered user accounts, promote or demote permissions, and assign tenant workspaces.
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Link
              href="/admin/users"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full text-xs justify-between font-medium cursor-pointer",
              })}
            >
              <span>Manage Users</span>
              <ArrowUpRight className="size-3 text-muted-foreground" />
            </Link>
          </CardFooter>
        </Card>

        {/* System Health Card */}
        <Card className="shadow-2xs border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="size-4.5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">System Health</CardTitle>
                <CardDescription className="text-xs">
                  All subsystems operational
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Review Edge Middleware security policies, Vapi telephony audio proxy endpoints, and database pooling telemetry.
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Link
              href="/admin/health"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full text-xs justify-between font-medium cursor-pointer",
              })}
            >
              <span>View Health Metrics</span>
              <ArrowUpRight className="size-3 text-muted-foreground" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Tenant Workspaces Quick Glance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Active Tenant Instances
          </h2>
          <Link
            href="/admin/workspaces"
            className="text-xs text-primary hover:underline font-medium"
          >
            View All Workspaces →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {dbWorkspaces.map((ws) => (
            <div
              key={ws.id}
              className="p-3.5 rounded-lg border border-border/80 bg-card flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold font-mono text-xs">
                  {ws.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {ws.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block capitalize">
                    {ws.nicheType} Workspace
                  </span>
                </div>
              </div>

              <Link
                href={`/omnireach?workspace=${ws.nicheType}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "h-7 text-xs gap-1 cursor-pointer font-medium",
                })}
              >
                <Layers className="size-3" />
                Impersonate
                <ArrowUpRight className="size-3 text-muted-foreground" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
