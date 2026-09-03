import * as React from "react"
import { CallDetailView } from "@/components/call-detail-view"

interface CallDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CallDetailPage({
  params,
  searchParams,
}: CallDetailPageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const workspace = (resolvedSearchParams?.workspace as string) || "legal"

  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-xs text-muted-foreground">
          Loading call transcript...
        </div>
      }
    >
      <CallDetailView id={id} initialWorkspace={workspace} />
    </React.Suspense>
  )
}
