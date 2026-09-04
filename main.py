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


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Dispatch CRM API"}
