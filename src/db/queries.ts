import { db } from "@/db"
import { workspaces, marketplaceLeads } from "@/db/schema"
import { eq } from "drizzle-orm"

export type WorkspaceRecord = typeof workspaces.$inferSelect
export type LeadRecord = typeof marketplaceLeads.$inferSelect

export async function getWorkspaces(): Promise<WorkspaceRecord[]> {
  try {
    const list = await db.select().from(workspaces)
    return list
  } catch (error) {
    console.error("Error fetching workspaces:", error)
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
