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
import { Separator } from "@/components/ui/separator"
import { loginAction, githubLoginAction, type LoginFormState } from "@/app/login/actions"

export function LoginView() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/overview"

  const [state, formAction, isPending] = useActionState<LoginFormState | null, FormData>(
    loginAction,
    null
  )

  const [isGithubPending, startGithubTransition] = React.useTransition()

  const [email, setEmail] = React.useState("admin@crm.com")
  const [password, setPassword] = React.useState("admin123")

  const handleGithubSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startGithubTransition(async () => {
      const formData = new FormData()
      formData.append("callbackUrl", callbackUrl)
      await githubLoginAction(formData)
    })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Layers className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
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
            <CardTitle className="text-lg font-bold">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Authenticate to access the multi-tenant OmniReach workspace
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
                <AlertCircle className="size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {/* GitHub OAuth Provider Button */}
            <form onSubmit={handleGithubSubmit}>
              <Button
                type="submit"
                variant="outline"
                disabled={isGithubPending || isPending}
                className="w-full h-9 gap-2 text-xs font-medium cursor-pointer"
              >
                {isGithubPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <svg className="size-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                )}
                Continue with GitHub
              </Button>
            </form>

            <div className="relative flex items-center justify-center">
              <Separator className="w-full" />
              <span className="absolute bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Or continue with email
              </span>
            </div>

            {/* Standard Credentials Form */}
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

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

              <Button
                type="submit"
                disabled={isPending || isGithubPending}
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
            </form>
          </CardContent>

          <CardFooter className="pt-0 pb-4 text-center justify-center text-[11px] text-muted-foreground">
            Multi-Tenant Outbound CRM • Auth.js Protected
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
