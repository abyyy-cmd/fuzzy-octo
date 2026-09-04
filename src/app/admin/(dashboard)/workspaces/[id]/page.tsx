import * as React from "react"
import { notFound } from "next/navigation"
import { getWorkspaceById, getLeadsByWorkspace } from "@/db/queries"
import { AdminWorkspaceDetailView } from "@/components/admin-workspace-detail-view"

export const dynamic = "force-dynamic"

interface AdminWorkspaceDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AdminWorkspaceDetailPageProps) {
  const { id } = await params
  const workspace = await getWorkspaceById(id)
  return {
    title: `${workspace?.name || id} | Super Admin Workspace`,
    description: `Super admin management for ${workspace?.name || id} tenant instance.`,
  }
}

export default async function AdminWorkspaceDetailPage({
  params,
}: AdminWorkspaceDetailPageProps) {
  const { id } = await params
  const workspace = await getWorkspaceById(id)

  if (!workspace) {
    notFound()
  }

  const leads = await getLeadsByWorkspace(workspace.nicheType || workspace.id)

  return (
    <AdminWorkspaceDetailView
      workspace={workspace}
      leads={leads}
    />
  )
}
