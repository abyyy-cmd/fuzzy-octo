import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const callId = url.searchParams.get("callId")

  if (!callId) {
    return NextResponse.json({ error: "Missing callId" }, { status: 400 })
  }

  try {
    const vapiKey = process.env.VAPI_PRIVATE_API_KEY
    if (!vapiKey) {
      console.error("ERROR: VAPI_PRIVATE_API_KEY is undefined in .env.local!")
    }

    // Hit the specific artifact endpoint and intercept the redirect
    const response = await fetch(`https://api.vapi.ai/call/${callId}/mono-recording`, {
      method: "GET",
      headers: { Authorization: `Bearer ${vapiKey}` },
      redirect: "manual",
    })

    // Vapi returns a 302 Found with the authenticated URL in the Location header
    if (response.status === 302 || response.status === 307) {
      const signedUrl = response.headers.get("location")
      console.log("SUCCESS: Generated Presigned URL ->", signedUrl)
      return NextResponse.json({ recordingUrl: signedUrl })
    }

    console.log("WARNING: Artifact not ready yet. Status:", response.status)
    return NextResponse.json({ recordingUrl: null })
  } catch (error) {
    console.error("Server Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
