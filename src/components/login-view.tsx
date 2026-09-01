"use client"

import * as React from "react"
import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Layers, Lock, Mail, AlertCircle, ArrowRight, Loader2, KeyRound } from "lucide-react"

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
import { loginAction, type LoginFormState } from "@/app/login/actions"

export function LoginView() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/overview"

  const [state, formAction, isPending] = useActionState<LoginFormState | null, FormData>(
    loginAction,
    null
  )

  const [email, setEmail] = React.useState("admin@crm.com")
  const [password, setPassword] = React.useState("admin123")

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Layers className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              OmniReach CRM
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Omnichannel Multi-Tenant Outbound Engine
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-border/80">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-lg font-bold">Admin Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access the multi-tenant OmniReach platform
            </CardDescription>
          </CardHeader>

          <form action={formAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <CardContent className="space-y-4">
              {state?.error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="admin@crm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>

              {/* Demo Credentials Helper */}
              <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1 text-foreground">
                    <KeyRound className="size-3 text-primary" /> Demo Admin Access
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    NextAuth v5
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Email: <span className="font-mono text-foreground font-medium">admin@crm.com</span> • Password: <span className="font-mono text-foreground font-medium">admin123</span>
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-9 gap-2 text-xs font-semibold cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
