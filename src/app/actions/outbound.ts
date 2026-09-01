"use server"

import { db } from "@/db"
import { marketplaceLeads } from "@/db/schema"

interface MockLead {
  company_name: string
  primary_contact: string
  email: string
  phone?: string
  linkedin_url?: string
  workspace_id?: string
}

export async function pushLeadsToManyreach(leads: MockLead[]) {
  try {
    // 1. Insert leads into Neon Postgres marketplace_leads table via Drizzle
    const insertedLeads = await db
      .insert(marketplaceLeads)
      .values(
        leads.map((lead) => ({
          companyName: lead.company_name,
          primaryContact: lead.primary_contact,
          email: lead.email,
          phone: lead.phone,
          linkedinUrl: lead.linkedin_url,
          workspaceId: lead.workspace_id,
          leadStatus: "prospecting",
        }))
      )
      .returning()

    console.log("Mock push to Manyreach successful for", insertedLeads.length, "leads")

    return { success: true, count: insertedLeads.length }
  } catch (error) {
    console.error("Server Action Error:", error)
    return { success: false, error: "Internal Server Error" }
  }
}
