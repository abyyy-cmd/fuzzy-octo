import * as React from "react"
import { MeetingsView } from "@/components/meetings-view"

export default function MeetingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-xs text-muted-foreground">
          Loading Booked Meetings...
        </div>
      }
    >
      <MeetingsView />
    </React.Suspense>
  )
}
