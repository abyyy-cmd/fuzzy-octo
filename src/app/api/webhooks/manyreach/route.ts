import { NextResponse } from "next/server"
import { db } from "@/db"
import { leadInteractions, marketplaceLeads } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    // Check if the event is a prospect reply
    if (payload.event !== "reply") {
      return NextResponse.json({ message: "Ignored event type" }, { status: 200 })
    }

    // 1. Insert interaction into Neon Postgres via Drizzle
    const [interaction] = await db
      .insert(leadInteractions)
      .values({
        leadId: payload.data.lead_id,
        channel: "manyreach",
        eventType: "replied",
        content: payload.data.message_body,
        metadata: payload,
      })
      .returning()

    // 2. Update lead status in marketplace_leads to 'replied'
    if (payload.data.lead_id) {
      await db
        .update(marketplaceLeads)
        .set({
          leadStatus: "replied",
          lastInteractionAt: new Date(),
        })
        .where(eq(marketplaceLeads.id, payload.data.lead_id))
    }

    return NextResponse.json({ success: true, interaction }, { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
