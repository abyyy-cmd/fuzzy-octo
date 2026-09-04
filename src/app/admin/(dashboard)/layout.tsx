import * as React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { auth } from "@/auth"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
        {children}
      </main>
    </div>
  )
}
