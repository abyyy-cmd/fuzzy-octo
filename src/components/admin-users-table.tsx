"use client"

import * as React from "react"
import {
  Users,
  ShieldCheck,
  User,
  Search,
  Trash2,
  Sparkles,
  Calendar,
  KeyRound,
  Plus,
  Check,
  X,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { toast } from "sonner"
import type { UserRecord } from "@/db/queries"

interface AdminUsersTableProps {
  initialUsers: UserRecord[]
}

export function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  // Combine database users with standard seed accounts
  const [usersList, setUsersList] = React.useState<any[]>(() => {
    const seed = [
      {
        id: "usr-admin-01",
        email: "admin@crm.com",
        name: "Root Super Admin",
        role: "SUPERADMIN",
        workspace: "all",
        createdAt: new Date("2026-01-01"),
      },
      {
        id: "usr-legal-02",
        email: "legal@omnireach.com",
        name: "Sterling Law Intake",
        role: "USER",
        workspace: "legal",
        createdAt: new Date("2026-01-15"),
      },
      {
        id: "usr-dental-03",
        email: "dental@omnireach.com",
        name: "Apex Smiles Dental",
        role: "USER",
        workspace: "dental",
        createdAt: new Date("2026-02-01"),
      },
    ]

    const merged = [...seed]
    initialUsers.forEach((u) => {
      if (!merged.some((m) => m.email === u.email)) {
        merged.push({
          id: u.id,
          email: u.email,
          name: u.name || u.email.split("@")[0],
          role: u.role?.toUpperCase() === "ADMIN" || u.role?.toUpperCase() === "SUPERADMIN" ? "SUPERADMIN" : "USER",
          workspace: u.email.includes("law") || u.email.includes("legal") ? "legal" : "dental",
          createdAt: u.createdAt || new Date(),
        })
      }
    })
    return merged
  })

  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddingUser, setIsAddingUser] = React.useState(false)
  const [newEmail, setNewEmail] = React.useState("")
  const [newRole, setNewRole] = React.useState("USER")
  const [newWorkspace, setNewWorkspace] = React.useState("legal")

  const handleToggleRole = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextRole = u.role === "SUPERADMIN" ? "USER" : "SUPERADMIN"
          toast.success(`Updated role for ${u.email} to ${nextRole}`)
          return { ...u, role: nextRole }
        }
        return u
      })
    )
  }

  const handleDeleteUser = (id: string, email: string) => {
    if (email === "admin@crm.com") {
      toast.error("Cannot delete root Super Admin account")
      return
    }
    setUsersList((prev) => prev.filter((u) => u.id !== id))
    toast.success(`Removed user: ${email}`)
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("Please provide a valid email address")
      return
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email: newEmail.trim().toLowerCase(),
      name: newEmail.split("@")[0],
      role: newRole,
      workspace: newRole === "SUPERADMIN" ? "all" : newWorkspace,
      createdAt: new Date(),
    }

    setUsersList((prev) => [newUser, ...prev])
    toast.success(`Added user: ${newUser.email}`)
    setNewEmail("")
    setIsAddingUser(false)
  }

  const filtered = usersList.filter((u) => {
    const q = searchQuery.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q) ||
      u.workspace.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Add User Form (Collapsible) */}
      {isAddingUser && (
        <Card className="shadow-xs border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Plus className="size-4 text-primary" />
                  Register Global Platform User
                </CardTitle>
                <CardDescription className="text-xs">
                  Create a new user account and assign them to a workspace or super admin role
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsAddingUser(false)}
                className="cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <form onSubmit={handleAddUser}>
            <CardContent className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="usr-email" className="text-xs">Email Address</Label>
                  <Input
                    id="usr-email"
                    type="email"
                    placeholder="user@firm.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="usr-role" className="text-xs">Role Permission</Label>
                  <select
                    id="usr-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="USER">Client / Tenant User</option>
                    <option value="SUPERADMIN">Super Admin (Root)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="usr-ws" className="text-xs">Assigned Workspace</Label>
                  <select
                    id="usr-ws"
                    disabled={newRole === "SUPERADMIN"}
                    value={newRole === "SUPERADMIN" ? "all" : newWorkspace}
                    onChange={(e) => setNewWorkspace(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    <option value="all">All Workspaces (Super Admin)</option>
                    <option value="legal">Legal Intake (Law Firm)</option>
                    <option value="dental">Dental Clinic</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingUser(false)}
                className="h-7 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                <Check className="size-3.5" />
                Add User Account
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Main Users Table */}
      <Card className="shadow-2xs border-border/80">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Global User Accounts
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Manage all registered platform operators and client tenant users
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search users, emails, roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              {!isAddingUser && (
                <Button
                  size="sm"
                  onClick={() => setIsAddingUser(true)}
                  className="h-8 text-xs gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  Add User
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-xs">User / Email</TableHead>
                <TableHead className="font-mono text-xs">Role</TableHead>
                <TableHead className="font-mono text-xs">Assigned Workspace</TableHead>
                <TableHead className="font-mono text-xs">Created Date</TableHead>
                <TableHead className="font-mono text-xs">Role Switch</TableHead>
                <TableHead className="text-right font-mono text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No users matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const isSuperAdmin = u.role === "SUPERADMIN"

                  return (
                    <TableRow key={u.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-xs text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex size-7 items-center justify-center rounded-lg font-bold font-mono text-[11px] ${
                              isSuperAdmin
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isSuperAdmin ? (
                              <ShieldCheck className="size-4 text-primary" />
                            ) : (
                              <User className="size-4" />
                            )}
                          </div>
                          <div>
                            <span>{u.name || u.email}</span>
                            <span className="block text-[10px] text-muted-foreground font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isSuperAdmin ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] shadow-none">
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            Client User
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-[11px] capitalize"
                        >
                          <Sparkles className="size-3 text-muted-foreground mr-1" />
                          {u.workspace}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString()
                              : "Active"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRole(u.id)}
                          className="h-7 text-xs font-medium cursor-pointer hover:bg-muted"
                        >
                          {isSuperAdmin ? "Demote to User" : "Promote to Admin"}
                        </Button>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={u.email === "admin@crm.com"}
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
