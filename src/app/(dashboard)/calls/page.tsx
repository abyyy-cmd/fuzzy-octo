import * as React from "react"
import { CallsView } from "@/components/calls-view"

export default function CallsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-xs text-muted-foreground">
          Loading Call History...
        </div>
      }
    >
      <CallsView />
    </React.Suspense>
  )
}
