import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Vapi sends event type inside body.message.type (or top-level body.type)
    const eventType = body?.message?.type || body?.type

    switch (eventType) {
      case "status-update":
        console.log("Vapi Status:", body.message?.status || body?.status)
        break

      case "transcript":
        console.log("Vapi Transcript Event Received")
        break

      case "end-of-call-report":
        console.log(
          "Call Ended. Reason:",
          body.message?.endedReason || body?.endedReason
        )
        if (body.message?.summary || body?.summary) {
          console.log("Call Summary:", body.message?.summary || body?.summary)
        }
        break

      default:
        console.log("Received Vapi event:", eventType)
        break
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 })
  } catch (error) {
    console.error("Vapi Webhook Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
