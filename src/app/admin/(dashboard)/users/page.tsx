import * as React from "react"
import { getGlobalUsers } from "@/db/queries"
import { AdminUsersTable } from "@/components/admin-users-table"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Global Users | OmniReach Super Admin",
  description: "Manage operators and client users across all workspaces.",
}

export default async function AdminUsersPage() {
  const users = await getGlobalUsers()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Global Platform Users
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, promote, and manage all operator accounts and tenant workspace users.
        </p>
      </div>

      <AdminUsersTable initialUsers={users} />
    </div>
  )
}
