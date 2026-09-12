import uuid
from typing import Optional
from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field

# Initialize FastAPI application
app = FastAPI(
    title="Dispatch CRM API",
    description="Healthcare dispatch CRM endpoint to ingest inbound meeting payloads from Voice AI agents.",
    version="1.0.0",
)

# Expected Bearer authorization token
EXPECTED_AUTH_HEADER = "Bearer super_secret_crm_key_123"


# Pydantic schema for meeting payload
class MeetingData(BaseModel):
    patient_name: str = Field(..., description="Full name of the patient")
    phone_number: str = Field(..., description="Contact phone number")
    email: Optional[str] = Field(default="Not provided", description="Patient email address")
    location: Optional[str] = Field(default="Not provided", description="Patient location / clinic address")
    reason: str = Field(..., description="Chief medical complaint / reason for visit")
    appointment_time: str = Field(..., description="Scheduled appointment date & time")


@app.post("/v1/meetings", status_code=status.HTTP_200_OK)
async def create_meeting(
    payload: MeetingData,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    # Enforce exact Bearer token verification
    if not authorization or authorization != EXPECTED_AUTH_HEADER:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Console output for dispatch CRM operator & database placeholder
    print("\n========================================")
    print("📞 INBOUND VOICE AI MEETING RECEIVED")
    print("========================================")
    print(f"Patient Name    : {payload.patient_name}")
    print(f"Appointment Time: {payload.appointment_time}")
    print(f"Reason for Visit: {payload.reason}")
    print(f"Phone Number    : {payload.phone_number}")
    print(f"Email           : {payload.email}")
    print(f"Location        : {payload.location}")
    print("========================================\n")

    # Generate mock meeting ID (e.g. 12345-abcde)
    meeting_id = f"12345-{uuid.uuid4().hex[:5]}"

    # Return standardized JSON response
    return {
        "status": "success",
        "message": f"Appointment successfully scheduled for {payload.patient_name}",
        "meeting_id": meeting_id,
    }


# Mapping of Assistant IDs to Tenant Namespaces
ASSISTANT_TENANT_MAP = {
    "ast_dental_123": "dental_clinic",
    "ast_dental_smiles": "dental_clinic",
    "ast_legal_123": "law_firm",
    "ast_lawyer_sterling": "law_firm",
}


@app.post("/v1/webhooks/vapi", status_code=status.HTTP_200_OK)
async def vapi_multitenant_webhook_listener(
    payload: dict,
    tenant: Optional[str] = None,
    tenant_id: Optional[str] = None,
):
    """
    Multi-tenant inbound webhook listener for Vapi AI voice agents.
    Routes calls via ?tenant=luca_dental or ?tenant=luca_law query parameter,
    locates contact by phone number in tenant database, and updates disposition.
    """
    message = payload.get("message", payload)
    event_type = message.get("type")

    # 1. Validate that message.type equals "end-of-call-report"
    if event_type != "end-of-call-report":
        return {
            "status": "ignored",
            "message": f"Event type '{event_type}' ignored. Expected 'end-of-call-report'.",
        }

    # 2. Extract tenant from URL query parameters (e.g. ?tenant=luca_dental or ?tenant=luca_law)
    target_tenant = tenant or tenant_id

    # 3. Extract call details & identifiers
    call_data = message.get("call", {})
    call_id = call_data.get("id", message.get("callId", "unknown_call"))
    ended_reason = message.get("endedReason", "unknown")
    assistant_id = call_data.get("assistantId", message.get("assistantId"))

    # Extract customer phone number (message.call.customer.number)
    customer_info = call_data.get("customer", {})
    customer_number = (
        customer_info.get("number")
        if isinstance(customer_info, dict)
        else message.get("customer", {}).get("number")
    ) or call_data.get("phoneNumber")

    # Fallback to assistantId mapping if tenant query param wasn't supplied
    if not target_tenant and assistant_id:
        target_tenant = ASSISTANT_TENANT_MAP.get(assistant_id)
        if not target_tenant:
            if "dental" in assistant_id.lower():
                target_tenant = "luca_dental"
            elif "legal" in assistant_id.lower() or "law" in assistant_id.lower():
                target_tenant = "luca_law"

    target_tenant = target_tenant or "luca_law"

    # 4. Extract successEvaluation & compute disposition
    success_eval = (
        call_data.get("successEvaluation")
        if "successEvaluation" in call_data
        else message.get("successEvaluation", message.get("analysis", {}).get("successEvaluation"))
    )

    is_success = (
        success_eval in [True, "true", "True", "positive", "success", "Meeting Booked"]
        or str(success_eval).lower() == "true"
    )

    # If calendar event / successEvaluation positive -> "Meeting Booked", else -> exact endedReason string
    disposition = "Meeting Booked" if is_success else str(ended_reason)

    print("\n========================================")
    print("🏢 MULTI-TENANT VAPI REPORT RECEIVED")
    print("========================================")
    print(f"Target Tenant     : {target_tenant}")
    print(f"Assistant ID      : {assistant_id}")
    print(f"Call ID           : {call_id}")
    print(f"Customer Number   : {customer_number}")
    print(f"Ended Reason      : {ended_reason}")
    print(f"Success Evaluation: {success_eval}")
    print(f"Final Disposition : {disposition}")
    print("========================================\n")

    # 5. Database update logic for tenant's contact record
    # Example Tenant SQL Execution:
    # UPDATE tenant_contacts 
    # SET disposition = :disposition, last_contact_at = NOW() 
    # WHERE tenant_id = :target_tenant AND phone_number = :customer_number;

    return {
        "status": "success",
        "tenant_id": target_tenant,
        "call_id": call_id,
        "customer_number": customer_number,
        "disposition": disposition,
        "ended_reason": ended_reason,
        "success_evaluation": success_eval,
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Dispatch CRM API"}


