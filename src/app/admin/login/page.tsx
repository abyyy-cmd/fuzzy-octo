import * as React from "react"
import { AdminLoginView } from "@/components/admin-login-view"

export const metadata = {
  title: "Super Admin Login | OmniReach CRM",
  description: "Restricted Super Admin authentication portal for OmniReach platform operators.",
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-muted-foreground text-xs font-mono">
          Initializing Administrative Security Portal...
        </div>
      }
    >
      <AdminLoginView />
    </React.Suspense>
  )
}
