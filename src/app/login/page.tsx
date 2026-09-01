import * as React from "react"
import { LoginView } from "@/components/login-view"

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">
          Loading login...
        </div>
      }
    >
      <LoginView />
    </React.Suspense>
  )
}
