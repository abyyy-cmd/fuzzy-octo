import * as React from "react"
import { LeadsView } from "@/components/leads-view"

export default function LeadsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
          Loading leads...
        </div>
      }
    >
      <LeadsView />
    </React.Suspense>
  )
}
