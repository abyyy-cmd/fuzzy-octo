"use server"

import { getLeadsByWorkspace, getWorkspaceStats, type LeadRecord } from "@/db/queries"

export async function fetchWorkspaceLeads(nicheOrId: string): Promise<LeadRecord[]> {
  return await getLeadsByWorkspace(nicheOrId)
}

export async function fetchWorkspaceStats(nicheOrId: string) {
  return await getWorkspaceStats(nicheOrId)
}
