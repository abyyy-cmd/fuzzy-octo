import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { workspaces, callLogs } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

function resolveStatusCode(status?: string | null) {
  const norm = (status || "").toLowerCase().replace(/[\s-_]+/g, "_")
  if (norm === "converted") return "Converted"
  if (norm === "not_converted" || norm === "notconverted") return "Not Converted"
  return "Unknown"
}

async function resolveWorkspaceId(workspaceParam: string | null) {
  const niche = (workspaceParam || "legal").toLowerCase()
  const match = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.nicheType, niche))
    .limit(1)
  return match[0]?.id || niche
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceParam = searchParams.get("workspace")
    const workspaceId = await resolveWorkspaceId(workspaceParam)

    const logs = await db
      .select()
      .from(callLogs)
      .where(eq(callLogs.workspaceId, workspaceId))
      .orderBy(desc(callLogs.createdAt))

    return NextResponse.json({
      workspace: workspaceParam || "legal",
      workspaceId,
      count: logs.length,
      logs,
    })
  } catch (error) {
    console.error("Error fetching call logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch call logs" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { workspace, call } = body

    if (!workspace || !call) {
      return NextResponse.json(
        { error: "workspace and call are required" },
        { status: 400 }
      )
    }

    const workspaceId = await resolveWorkspaceId(String(workspace))
    const transcript = Array.isArray(call.messages) ? call.messages : null
    const callCategory =
      call.callCategory ||
      call.analysis?.structuredData?.callCategory ||
      (call as any).structuredData?.callCategory ||
      null

    const inserted = await db
      .insert(callLogs)
      .values({
        workspaceId,
        vapiCallId: call.vapiCallId || undefined,
        customerNumber: call.customerNumber || null,
        callDirection: call.direction || null,
        duration: call.duration || null,
        callStatus: resolveStatusCode(
          call.disposition ||
            call.analysis?.structuredData?.disposition ||
            "Unknown"
        ),
        callCategory: typeof callCategory === "string" ? callCategory : null,
        transcript,
        summary: call.analysis?.summary || null,
      })
      .returning()

    return NextResponse.json({ log: inserted[0] }, { status: 201 })
  } catch (error) {
    console.error("Error saving call log:", error)
    return NextResponse.json(
      { error: "Failed to save call log" },
      { status: 500 }
    )
  }
}