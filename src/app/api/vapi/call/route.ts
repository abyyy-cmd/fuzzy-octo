import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const callId = searchParams.get("callId")

    if (!callId) {
      return NextResponse.json(
        { error: "callId parameter is required" },
        { status: 400 }
      )
    }

    const apiKey =
      process.env.VAPI_PRIVATE_API_KEY ||
      process.env.VAPI_API_KEY ||
      process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

    if (!apiKey || apiKey === "placeholder-key") {
      return NextResponse.json(
        {
          error: "VAPI_PRIVATE_API_KEY is not configured",
          recordingUrl: null,
        },
        { status: 500 }
      )
    }

    const vapiRes = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!vapiRes.ok) {
      const errorText = await vapiRes.text()
      console.error(`Vapi API responded with status ${vapiRes.status}:`, errorText)
      return NextResponse.json(
        {
          error: `Vapi API error: ${vapiRes.statusText}`,
          details: errorText,
          recordingUrl: null,
        },
        { status: vapiRes.status }
      )
    }

    const data = await vapiRes.json()

    // Vapi can store recording URL in recordingUrl, stereoRecordingUrl, or inside artifact
    const recordingUrl =
      data.recordingUrl ||
      data.stereoRecordingUrl ||
      data.artifact?.recordingUrl ||
      data.artifact?.stereoRecordingUrl ||
      null

    return NextResponse.json({
      success: true,
      callId,
      status: data.status,
      endedReason: data.endedReason,
      recordingUrl,
      stereoRecordingUrl: data.stereoRecordingUrl || data.artifact?.stereoRecordingUrl || null,
      summary: data.analysis?.summary || data.summary || null,
      transcript: data.transcript || null,
    })
  } catch (err) {
    console.error("Error fetching Vapi call recording:", err)
    return NextResponse.json(
      {
        error: "Internal server error fetching call recording",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
