import * as React from "react"
import { OverviewView } from "@/components/overview-view"

export default function OverviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
          Loading OmniReach workspace...
        </div>
      }
    >
      <OverviewView />
    </React.Suspense>
  )
}
