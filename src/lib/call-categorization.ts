// src/lib/call-categorization.ts
// Industry-specific categorization helper for Law Firm and Dental Clinic multi-tenant CRM

export function getCategoryHeader(tenantOrWorkspace?: string | null): string {
  const norm = (tenantOrWorkspace || "").toLowerCase().trim()
  if (norm === "luca_law" || norm === "legal" || norm.includes("law") || norm.includes("legal")) {
    return "Matter Type"
  }
  if (norm === "luca_dental" || norm === "dental" || norm.includes("dental") || norm.includes("clinic")) {
    return "Service Requested"
  }
  return "Call Category"
}

export function inferCallCategory(
  call: {
    callCategory?: string | null
    disposition?: string | null
    analysis?: { structuredData?: { callCategory?: string; [key: string]: any }; summary?: string }
    messages?: Array<{ role?: string; text?: string }>
    summary?: string | null
  },
  tenantOrWorkspace?: string | null
): string {
  // 1. If explicit category already stored, use it
  const explicit =
    call.callCategory ||
    call.analysis?.structuredData?.callCategory ||
    (call as any).structuredData?.callCategory
  if (explicit && typeof explicit === "string" && explicit.trim() && explicit !== "Unknown") {
    return explicit.trim()
  }

  const normWs = (tenantOrWorkspace || "legal").toLowerCase().trim()
  const isDental = normWs === "luca_dental" || normWs === "dental" || normWs.includes("dental")

  const transcriptText = Array.isArray(call.messages)
    ? call.messages.map((m) => m.text || "").join(" ")
    : ""
  const summaryText = call.summary || call.analysis?.summary || ""
  const combined = `${transcriptText} ${summaryText}`.toLowerCase()

  if (isDental || combined.includes("tooth") || combined.includes("teeth") || combined.includes("dental") || combined.includes("dentist")) {
    if (combined.includes("root canal") || combined.includes("endodontic")) return "Root Canal Therapy"
    if (combined.includes("implant") || combined.includes("crown") || combined.includes("bridge")) return "Dental Implants & Crowns"
    if (combined.includes("clean") || combined.includes("checkup") || combined.includes("exam") || combined.includes("hygiene")) return "Routine Cleaning & Exam"
    if (combined.includes("whitening") || combined.includes("veneer") || combined.includes("cosmetic")) return "Cosmetic Dentistry"
    if (combined.includes("emergency") || combined.includes("pain") || combined.includes("ache") || combined.includes("broken") || combined.includes("extraction") || combined.includes("wisdom")) return "Emergency Care & Extraction"
    if (combined.includes("invisalign") || combined.includes("braces") || combined.includes("orthodontic")) return "Orthodontics / Invisalign"
    return "General Dental Inquiry"
  }

  // Legal matter categorization
  if (combined.includes("car accident") || combined.includes("accident") || combined.includes("injury") || combined.includes("crash") || combined.includes("slip and fall") || combined.includes("hospital") || combined.includes("hurt")) {
    return "Personal Injury"
  }
  if (combined.includes("property") || combined.includes("landlord") || combined.includes("tenant") || combined.includes("lease") || combined.includes("eviction") || combined.includes("real estate") || combined.includes("owner")) {
    return "Real Estate & Property"
  }
  if (combined.includes("divorce") || combined.includes("custody") || combined.includes("child support") || combined.includes("marital") || combined.includes("spouse") || combined.includes("separation")) {
    return "Family Law & Divorce"
  }
  if (combined.includes("arrest") || combined.includes("police") || combined.includes("dui") || combined.includes("dwi") || combined.includes("felony") || combined.includes("criminal") || combined.includes("charge")) {
    return "Criminal Defense"
  }
  if (combined.includes("estate") || combined.includes("will") || combined.includes("trust") || combined.includes("probate") || combined.includes("inheritance")) {
    return "Estate Planning & Probate"
  }
  if (combined.includes("visa") || combined.includes("greencard") || combined.includes("green card") || combined.includes("citizenship") || combined.includes("immigration") || combined.includes("asylum")) {
    return "Immigration Law"
  }
  if (combined.includes("business") || combined.includes("contract") || combined.includes("corporate") || combined.includes("llc") || combined.includes("incorporation") || combined.includes("partnership")) {
    return "Corporate & Business Law"
  }
  if (combined.includes("employment") || combined.includes("wrongful termination") || combined.includes("workplace") || combined.includes("discrimination") || combined.includes("harassment") || combined.includes("wage")) {
    return "Employment & Labor Law"
  }
  if (combined.includes("consultation") || combined.includes("appointment") || combined.includes("attorney") || combined.includes("lawyer")) {
    return "General Legal Consultation"
  }

  return "General Legal Inquiry"
}
