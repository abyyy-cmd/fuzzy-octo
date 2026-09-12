import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const MODEL = process.env.VAPI_ANALYZE_MODEL || "claude-sonnet-4-6"

interface AnalyzeCall {
  id: string | number
  messages?: Array<{ role?: string; text?: string }>
  customerNumber?: string
  date?: string
  duration?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const calls: AnalyzeCall[] = Array.isArray(body?.calls) ? body.calls : []

    if (calls.length === 0) {
      return NextResponse.json(
        { error: "calls array with at least one record is required" },
        { status: 400 }
      )
    }

    const baseURL = process.env.NEON_AI_GATEWAY_BASE_URL
    const token = process.env.NEON_AI_GATEWAY_TOKEN

    if (!baseURL || !token) {
      return NextResponse.json(
        {
          error:
            "Neon AI Gateway is not configured. Enable preview.aiGateway in neon.ts, then run `neon deploy` (or `neon env pull`) to inject NEON_AI_GATEWAY_BASE_URL and NEON_AI_GATEWAY_TOKEN.",
        },
        { status: 503 }
      )
    }

    const transcriptBlocks = calls.map((call, idx) => {
      const transcript =
        call.messages
          ?.map((m) => {
            const role = m.role === "assistant" ? "agent" : "customer"
            return `${role}: ${m.text || ""}`
          })
          .join("\n") || ""
      return `--- Call ${idx + 1} (id: ${call.id}) ---
${call.customerNumber ? `Caller: ${call.customerNumber}\n` : ""}${transcript}`
    })

    const systemPrompt = `You are an AI sales-call analyzer. Read each call transcript below and classify the OUTCOME of the call into one of exactly these values:
- "Converted": the customer committed to a meeting, an appointment, a purchase, a follow-up action, or otherwise took a positive next step (e.g. agreed to book a consultation, said yes to a callback, accepted an offer).
- "Not Converted": the customer declined, was uninterested, frustrated, no-show, or clearly rejected the offer with no next step.
- "Unknown": the transcript is too short/empty, ambiguous, or ends without a clear positive or negative outcome.

Rules:
- Read the FULL transcript before deciding. A short polite closing does NOT mean converted.
- Base the decision only on what actually happened in the conversation, not on intent.
- Return ONLY a valid JSON object mapping call ids to dispositions, e.g. {"<callId>":"Converted"}.
- Never include anything outside the JSON object.`

    const userPrompt = transcriptBlocks.join("\n\n")

    const gatewayRes = await fetch(`${baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    })

    if (!gatewayRes.ok) {
      const errText = await gatewayRes.text()
      return NextResponse.json(
        { error: `AI gateway request failed (${gatewayRes.status})`, detail: errText },
        { status: 502 }
      )
    }

    const data = await gatewayRes.json()
    const content: string =
      data?.choices?.[0]?.message?.content || data?.output_text || ""
    if (!content) {
      return NextResponse.json(
        { error: "AI gateway returned an empty response" },
        { status: 502 }
      )
    }

    let parsed: Record<string, string> = {}
    try {
      const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "")
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = {}
    }

    const results = calls.map((call) => {
      const raw = String(parsed[String(call.id)] || parsed[`"${call.id}"`] || "")
      const norm = raw.toLowerCase().replace(/[\s-_]+/g, "_")
      let disposition: "Converted" | "Not Converted" | "Unknown"
      if (norm === "converted") disposition = "Converted"
      else if (norm === "not_converted" || norm === "notconverted")
        disposition = "Not Converted"
      else disposition = "Unknown"
      return { id: call.id, disposition }
    })

    return NextResponse.json({ results })
  } catch (err) {
    console.error("vapi/analyze error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}