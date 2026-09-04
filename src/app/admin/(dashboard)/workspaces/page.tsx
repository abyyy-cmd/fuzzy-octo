import * as React from "react"
import { getWorkspaces } from "@/db/queries"
import { AdminTenantsTable } from "@/components/admin-tenants-table"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Tenant Workspaces | OmniReach Super Admin",
  description: "Manage multi-tenant law firm and dental clinic environments.",
}

export default async function AdminWorkspacesPage() {
  const dbWorkspaces = await getWorkspaces()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tenant Workspaces
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Provision, inspect, and route multi-tenant client instances across Law Firms and Dental Clinics.
        </p>
      </div>

      <AdminTenantsTable initialWorkspaces={dbWorkspaces} />
    </div>
  )
}
