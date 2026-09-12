// test-webhook.mjs
// Standalone script to simulate a Vapi end-of-call-report payload locally.

const WEBHOOK_URL = "http://localhost:3000/api/webhooks/vapi?tenant=luca_law"

const mockPayload = {
  message: {
    type: "end-of-call-report",
    endedReason: "customer-ended-call",
    call: {
      id: `call_test_${Date.now()}`,
      status: "ended",
      type: "inboundPhoneCall",
      duration: 124,
      customer: {
        number: "+1234567890",
      },
      transcript: "This is a simulated test transcript.",
      analysis: {
        summary: "Prospective client called regarding a personal injury case consultation.",
        structuredData: {
          callStatus: "Converted",
          callCategory: "Personal Injury",
        },
      },
    },
  },
}

async function testWebhook() {
  console.log("========================================")
  console.log("🚀 SENDING SIMULATED VAPI WEBHOOK PAYLOAD")
  console.log("========================================")
  console.log(`Endpoint URL : ${WEBHOOK_URL}`)
  console.log(`Payload      :\n${JSON.stringify(mockPayload, null, 2)}\n`)

  try {
    const startTime = Date.now()
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockPayload),
    })

    const duration = Date.now() - startTime
    const responseText = await response.text()

    console.log("========================================")
    console.log("📡 RESPONSE RECEIVED")
    console.log("========================================")
    console.log(`Status Code  : ${response.status} ${response.statusText}`)
    console.log(`Latency      : ${duration}ms`)
    console.log("Response Body:")

    try {
      const parsedJson = JSON.parse(responseText)
      console.log(JSON.stringify(parsedJson, null, 2))
    } catch {
      console.log(responseText)
    }
    console.log("========================================")
  } catch (error) {
    console.error("❌ Request Error:", error.message)
    if (error.cause) {
      console.error("Cause:", error.cause)
    }
    console.error("\n💡 Make sure your Next.js local server is running on http://localhost:3000 (e.g. npm run dev).")
  }
}

testWebhook()
