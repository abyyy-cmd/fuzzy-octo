import { NextResponse } from "next/server"
import { db } from "@/db"
import { workspaces, marketplaceLeads, leadInteractions, callLogs } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// Mapping of known Vapi Assistant IDs to Tenant Workspaces (can also be configured via DB or env)
const ASSISTANT_TENANT_MAP: Record<string, string> = {
  // Dental Clinic assistants
  "ast_dental_123": "dental",
  "ast_dental_smiles": "dental",
  [process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_DENTAL || "dental_assistant_id"]: "dental",

  // Law Firm assistants
  "ast_legal_123": "legal",
  "ast_lawyer_sterling": "legal",
  [process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_LEGAL || "legal_assistant_id"]: "legal",
}

// Common keys Vapi assistants use for booking date/time in structuredData & variables
const DATETIME_KEYS = [
  "appointmentDateTime",
  "appointmentTime",
  "appointmentDate",
  "meetingDateTime",
  "meetingTime",
  "meetingDate",
  "scheduledDateTime",
  "scheduledTime",
  "scheduledDate",
  "datetime",
  "dateTime",
  "date",
  "time",
  "booking_time",
  "booking_date",
]

// Keys that clearly carry datetime values (skipped when scanning generic keys)
const DATETIME_ONLY_KEYS = [
  "appointmentDateTime",
  "appointmentTime",
  "meetingDateTime",
  "meetingTime",
  "scheduledDateTime",
  "scheduledTime",
  "datetime",
  "dateTime",
  "time",
  "booking_time",
]

function looksLikeDateValue(value: unknown): boolean {
  if (typeof value !== "string") return false
  const trimmed = value.trim()
  if (!trimmed || trimmed.toLowerCase() === "n/a") return false
  return (
    /\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/.test(trimmed) || // 9/15/2025, 09/15
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}/i.test(trimmed) || // Sept 15, September 15
    /\b\d{2}:\d{2}\b/.test(trimmed) || // 14:00, 2:00
    /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i.test(trimmed) || // 2pm, 2:00 PM
    /\d{4}-\d{2}-\d{2}/.test(trimmed) // ISO 2025-09-15
  )
}

function extractMeetingDateTime(call: any): string | null {
  if (!call) return null

  // 1. structuredData object
  const structured = call?.analysis?.structuredData
  const variables = call?.variables

  const candidates: string[] = []

  for (const source of [structured, variables]) {
    if (!source || typeof source !== "object") continue
    for (const key of DATETIME_KEYS) {
      const val = source[key]
      if (typeof val === "string" && val.trim() && looksLikeDateValue(val)) {
        candidates.push(val.trim())
      } else if (val !== undefined && val !== null && typeof val === "object") {
        // Nested date/time objects e.g. { date: "2025-09-15", time: "14:00" }
        for (const sub of DATETIME_KEYS) {
          const subVal = (val as any)[sub]
          if (typeof subVal === "string" && looksLikeDateValue(subVal)) {
            candidates.push(subVal.trim())
          }
        }
      }
    }
  }

  // Prefer datetimes recorded under dedicated date+time keys first
  const allSourceKeys = new Set([
    ...Object.keys(structured || {}),
    ...Object.keys(variables || {}),
  ])
  const hasDedicated = [...allSourceKeys].some((k) =>
    DATETIME_ONLY_KEYS.includes(k.toLowerCase())
  )
  if (hasDedicated) {
    const dated = candidates.find((c) => /date|\d{4}-\d{2}-\d{2}|\/\d{2,4}/i.test(c) || /\b\d{1,2}(?:st|nd|rd|th)?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/i.test(c))
    if (dated) return dated
  }

  if (candidates.length > 0) return candidates[0]

  // 2. summary text — look for patterns like "Sept 15 at 2:00 PM"
  const summary = typeof call?.analysis?.summary === "string" ? call.analysis.summary : ""
  const summaryMatch = summary.match(
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?(?:\s+at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i
  )
  if (summaryMatch) return summaryMatch[0]

  const isoMatch = summary.match(/\d{4}-\d{2}-\d{2}[T\s]\d{1,2}:\d{2}(?::\d{2})?/)
  if (isoMatch) return isoMatch[0]

  return null
}

function formatMeetingDisposition(raw: string | null): string {
  if (!raw) return "Meeting Booked"

  const trimmed = raw.trim()

  // Already looks like a plain friendly string (e.g. "Sept 15 at 2:00 PM") — use as-is
  if (!/\d{4}-\d{2}-\d{2}/.test(trimmed) && /\b(?:am|pm)\b/i.test(trimmed)) {
    return `Meeting Booked: ${trimmed}`
  }

  // ISO string — format to "Sept 15 at 2:00 PM"
  const iso = trimmed.match(/\d{4}-\d{2}-\d{2}[T\s]\d{1,2}:\d{2}(?::\d{2})?/)
  const date = iso ? new Date(iso[0]) : null
  if (date && !isNaN(date.getTime())) {
    const formatted = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    return `Meeting Booked: ${formatted}`
  }

  // Plain date + time components (e.g. "2025-09-15" or "9/15/2025 2:00 PM")
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    const formatted = parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    return `Meeting Booked: ${formatted}`
  }

  // Fall back to plain disposition if nothing usable
  return "Meeting Booked"
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const body = await req.json()

    // 1. Validate payload structure & extract message
    const message = body?.message || body
    const eventType = message?.type

    // 2. Validate that message.type equals "end-of-call-report"
    if (eventType !== "end-of-call-report") {
      return NextResponse.json(
        {
          status: "ignored",
          message: `Event type '${eventType}' ignored. Expected 'end-of-call-report'.`,
        },
        { status: 200 }
      )
    }

    // 3. Multi-Tenant Routing
    // Extract tenant directly from URL query parameters (e.g. ?tenant=luca_dental or ?tenant=luca_law)
    const rawTenant =
      url.searchParams.get("tenant") ||
      url.searchParams.get("tenant_id") ||
      url.searchParams.get("workspace")

    const callData = message?.call || {}
    const assistantId =
      callData?.assistantId ||
      message?.assistantId ||
      message?.assistant?.id ||
      null

    let targetTenantNiche = rawTenant
    if (!targetTenantNiche && assistantId) {
      targetTenantNiche = ASSISTANT_TENANT_MAP[assistantId]
      // Fallback heuristics based on assistant ID string pattern
      if (!targetTenantNiche) {
        if (assistantId.toLowerCase().includes("dental") || assistantId.toLowerCase().includes("clinic")) {
          targetTenantNiche = "dental"
        } else if (assistantId.toLowerCase().includes("legal") || assistantId.toLowerCase().includes("law")) {
          targetTenantNiche = "legal"
        }
      }
    }

    // Normalize tenant slug if prefixed (e.g., "luca_dental" -> "dental", "luca_law" -> "legal")
    if (targetTenantNiche) {
      if (targetTenantNiche.toLowerCase().includes("dental") || targetTenantNiche.toLowerCase().includes("clinic")) {
        targetTenantNiche = "dental"
      } else if (targetTenantNiche.toLowerCase().includes("law") || targetTenantNiche.toLowerCase().includes("legal")) {
        targetTenantNiche = "legal"
      }
    }

    targetTenantNiche = targetTenantNiche || "legal"

    // Default fallback to legal workspace if unspecified
    targetTenantNiche = targetTenantNiche || "legal"

    // 4. Resolve the tenant's workspace record from database
    const tenantWorkspaces = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.nicheType, targetTenantNiche))
      .limit(1)

    const workspaceId = tenantWorkspaces[0]?.id || targetTenantNiche

    // 5. Extract call details, customer phone number, endedReason, and successEvaluation
    const callId = callData?.id || message?.callId || "unknown_call"
    const endedReason = message?.endedReason || "unknown"
    const customerPhone =
      callData?.customer?.number ||
      message?.customer?.number ||
      callData?.phoneNumber ||
      null

    const successEvaluation =
      callData?.successEvaluation ??
      message?.successEvaluation ??
      message?.analysis?.successEvaluation

    // Structured Data Extraction — Vapi emits a strict callStatus Enum & callCategory
    const rawStatus = message?.call?.analysis?.structuredData?.callStatus
    const finalStatus = ["Converted", "Not Converted"].includes(rawStatus) ? rawStatus : "Unknown"

    // Extract callCategory from analysis structuredData
    const rawCategory =
      message?.call?.analysis?.structuredData?.callCategory ??
      message?.analysis?.structuredData?.callCategory ??
      callData?.analysis?.structuredData?.callCategory ??
      message?.call?.structuredData?.callCategory ??
      message?.structuredData?.callCategory ??
      null
    const callCategory = typeof rawCategory === "string" && rawCategory.trim() ? rawCategory.trim() : null

    const extractedDateTime = extractMeetingDateTime(callData)

    // 6. Compute client disposition based on call outcome
    const isSuccess =
      successEvaluation === true ||
      successEvaluation === "true" ||
      successEvaluation === "positive" ||
      successEvaluation === "success" ||
      successEvaluation === "Meeting Booked"

    // 6b. If booked, include the appointment date/time when it can be parsed
    const disposition = isSuccess
      ? formatMeetingDisposition(extractedDateTime)
      : endedReason

    console.log("========================================")
    console.log("🏢 MULTI-TENANT VAPI WEBHOOK PROCESSED")
    console.log("========================================")
    console.log(`Tenant Niche      : ${targetTenantNiche} (Workspace ID: ${workspaceId})`)
    console.log(`Assistant ID      : ${assistantId || "Not specified"}`)
    console.log(`Call ID           : ${callId}`)
    console.log(`Customer Phone    : ${customerPhone || "Not provided"}`)
    console.log(`Call Category     : ${callCategory || "Not specified"}`)
    console.log(`Ended Reason      : ${endedReason}`)
    console.log(`Success Evaluation: ${JSON.stringify(successEvaluation)}`)
    console.log(`Target Disposition: ${disposition}`)
    console.log("========================================\n")

    // 7. Query the specific tenant's database to locate contact record & update callCategory
    let updatedLeadId: string | null = null

    if (customerPhone) {
      // Find the specific contact belonging to THIS tenant workspace
      const matchingLeads = await db
        .select()
        .from(marketplaceLeads)
        .where(
          and(
            eq(marketplaceLeads.workspaceId, workspaceId),
            eq(marketplaceLeads.phone, customerPhone)
          )
        )
        .limit(1)

      if (matchingLeads.length > 0) {
        const lead = matchingLeads[0]
        updatedLeadId = lead.id

        // Update the contact's callCategory & last interaction timestamp
        await db
          .update(marketplaceLeads)
          .set({
            leadStatus: finalStatus,
            callCategory: callCategory,
            lastInteractionAt: new Date(),
          })
          .where(eq(marketplaceLeads.id, lead.id))

        // Log the call interaction record linked to the lead
        await db.insert(leadInteractions).values({
          leadId: lead.id,
          channel: "vapi",
          eventType: "call_completed",
          content: `Vapi Call [${callId}]: Category = ${callCategory || "N/A"}. Outcome = ${disposition}. Reason = ${endedReason}`,
          metadata: {
            callId,
            assistantId,
            endedReason,
            successEvaluation,
            callCategory,
            disposition,
            timestamp: new Date().toISOString(),
          },
        })
      }
    }

    // Also persist to callLogs table for call history logs
    try {
      await db.insert(callLogs).values({
        workspaceId,
        vapiCallId: callId,
        customerNumber: customerPhone,
        callDirection: callData?.type || "inboundPhoneCall",
        duration: callData?.duration ? `${Math.round(callData.duration)}s` : null,
        callStatus: finalStatus,
        callCategory: callCategory,
        transcript: message?.transcript ? [{ role: "assistant", text: message.transcript }] : null,
        summary: message?.analysis?.summary || callData?.analysis?.summary || null,
      })
    } catch (logErr) {
      console.error("Could not insert into call_logs in webhook:", logErr)
    }

    return NextResponse.json(
      {
        status: "success",
        tenant: targetTenantNiche,
        workspaceId,
        callId,
        customerPhone,
        callCategory,
        disposition,
        contactUpdated: !!updatedLeadId,
        leadId: updatedLeadId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Multi-tenant Vapi Webhook Error:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}


