import { db } from "@/db"
import { workspaces, marketplaceLeads, users } from "@/db/schema"
import { eq } from "drizzle-orm"

export type WorkspaceRecord = typeof workspaces.$inferSelect
export type LeadRecord = typeof marketplaceLeads.$inferSelect
export type UserRecord = typeof users.$inferSelect

export async function getWorkspaces(): Promise<WorkspaceRecord[]> {
  try {
    const list = await db.select().from(workspaces)
    return list
  } catch (error) {
    console.error("Error fetching workspaces:", error)
    return []
  }
}

export async function getWorkspaceById(idOrNiche: string): Promise<WorkspaceRecord | null> {
  try {
    const list = await db.select().from(workspaces)
    const match = list.find((w) => w.id === idOrNiche || w.nicheType === idOrNiche)
    if (match) return match

    // Fallback for custom or client workspaces
    return {
      id: idOrNiche,
      name:
        idOrNiche === "legal"
          ? "Sterling Law Group"
          : idOrNiche === "dental"
          ? "Apex Smiles Dental"
          : idOrNiche.charAt(0).toUpperCase() + idOrNiche.slice(1) + " Workspace",
      nicheType: idOrNiche.toLowerCase(),
      createdAt: new Date(),
    } as WorkspaceRecord
  } catch (error) {
    console.error("Error fetching workspace by id:", error)
    return null
  }
}

export async function getGlobalUsers(): Promise<UserRecord[]> {
  try {
    const list = await db.select().from(users)
    return list
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getLeadsByWorkspace(nicheOrId: string): Promise<LeadRecord[]> {
  try {
    // Find workspace by nicheType or id
    const matchedWorkspaces = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.nicheType, nicheOrId))

    const workspaceId = matchedWorkspaces[0]?.id || nicheOrId

    const leads = await db
      .select()
      .from(marketplaceLeads)
      .where(eq(marketplaceLeads.workspaceId, workspaceId))

    return leads
  } catch (error) {
    console.error("Error fetching leads by workspace:", error)
    return []
  }
}

export async function getWorkspaceStats(nicheOrId: string) {
  try {
    const leads = await getLeadsByWorkspace(nicheOrId)
    const totalSourced = leads.length
    const emailsSent = leads.filter((l) => l.channel === "manyreach" && l.leadStatus !== "prospecting").length
    const repliesReceived = leads.filter((l) => l.leadStatus === "replied" || l.leadStatus === "booked").length

    return {
      totalSourced,
      emailsSent,
      repliesReceived,
    }
  } catch (error) {
    console.error("Error computing workspace stats:", error)
    return {
      totalSourced: 0,
      emailsSent: 0,
      repliesReceived: 0,
    }
  }
}
