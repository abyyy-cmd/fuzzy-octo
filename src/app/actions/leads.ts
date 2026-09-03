"use server"

import { db } from "@/db"
import { workspaces, marketplaceLeads } from "@/db/schema"
import { getLeadsByWorkspace, getWorkspaceStats, type LeadRecord } from "@/db/queries"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export interface RawLeadInput {
  company_name?: string
  companyName?: string
  company?: string
  Company?: string
  "Company Name"?: string
  primary_contact?: string
  primaryContact?: string
  contact?: string
  Contact?: string
  "Primary Contact"?: string
  name?: string
  Name?: string
  email?: string
  Email?: string
  "Email Address"?: string
  phone?: string
  Phone?: string
  "Phone Number"?: string
  linkedin_url?: string
  linkedinUrl?: string
  linkedin?: string
  LinkedIn?: string
  "LinkedIn URL"?: string
  lead_status?: string
  leadStatus?: string
  status?: string
  Status?: string
  channel?: string
  Channel?: string
  workspace_id?: string
  workspaceId?: string
  [key: string]: any
}

export async function fetchWorkspaceLeads(nicheOrId: string): Promise<LeadRecord[]> {
  return await getLeadsByWorkspace(nicheOrId)
}

export async function fetchWorkspaceStats(nicheOrId: string) {
  return await getWorkspaceStats(nicheOrId)
}

export async function uploadLeadsBatch(
  param1: string | RawLeadInput[],
  param2?: string | RawLeadInput[]
): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    // Support flexible argument order: (workspaceId, leads) or (leads, workspaceId)
    const workspaceId =
      typeof param1 === "string" ? param1 : typeof param2 === "string" ? param2 : "legal"
    const leads =
      Array.isArray(param1) ? param1 : Array.isArray(param2) ? param2 : []

    if (!leads || leads.length === 0) {
      return { success: false, error: "No leads data provided in CSV" }
    }

    // 1. Query workspaces table by nicheType or UUID to find the actual workspace record
    let targetWorkspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.nicheType, workspaceId))
      .limit(1)

    // Fallback: If not found by nicheType slug, query by id UUID directly
    if (targetWorkspace.length === 0) {
      targetWorkspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1)
    }

    // 2. Validate workspace exists or throw error
    if (targetWorkspace.length === 0 || !targetWorkspace[0]?.id) {
      throw new Error("Workspace not found in database.")
    }

    // 3. Use the real database UUID from targetWorkspace[0].id
    const realWorkspaceId = targetWorkspace[0].id

    // 4. Construct mappedLeads array explicitly matching the schema
    const mappedLeads = leads.map((lead: any) => ({
      workspaceId: realWorkspaceId,
      companyName:
        lead.company_name ||
        lead.companyName ||
        lead.Company ||
        lead["Company Name"] ||
        lead.company ||
        "Unnamed Company",
      primaryContact:
        lead.primary_contact ||
        lead.primaryContact ||
        lead.Contact ||
        lead["Primary Contact"] ||
        lead.contact ||
        lead.name ||
        lead.Name ||
        null,
      email: lead.email || lead.Email || lead["Email Address"] || null,
      phone: lead.phone || lead.Phone || lead["Phone Number"] || null,
      linkedinUrl:
        lead.linkedin_url ||
        lead.linkedinUrl ||
        lead.LinkedIn ||
        lead["LinkedIn URL"] ||
        lead.linkedin ||
        null,
      leadStatus:
        lead.lead_status ||
        lead.leadStatus ||
        lead.status ||
        lead.Status ||
        "prospecting",
      channel: lead.channel || lead.Channel || "manyreach",
    }))

    // Required Debug Logging
    console.log("Mapped Leads:", mappedLeads)

    // 5. Insert mapped leads into Neon Postgres marketplace_leads table via Drizzle
    await db.insert(marketplaceLeads).values(mappedLeads)

    // Revalidate dashboard routes
    revalidatePath("/omnireach")
    revalidatePath("/leads")

    return { success: true, count: mappedLeads.length }
  } catch (error) {
    // Required Debug Error Logging
    console.error("Database Insert Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database error message",
    }
  }
}
