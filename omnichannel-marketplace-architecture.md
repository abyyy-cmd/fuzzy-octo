# Omnichannel Lead Marketplace - Technical Architecture

**Author:** Bismah Habib, AI Automation Intern
**GitHub:** abyyy-cmd

## System Overview
This document outlines the architecture for a multi-tenant, omnichannel CRM (The "Marketplace"). The system serves as a centralized hub for managing outbound lead generation across distinct niches (Law Firms and Dental Clinics). 

The architecture is designed to decouple data sourcing and sequence orchestration from the core frontend, allowing specialized teammates to handle scraping and sending, while the Next.js application acts as the central nervous system.

### Team Distribution
*   **Data Sourcing:** Scraping and verifying Law Firm and Dental Clinic contacts.
*   **Sequence Orchestration:** Managing cold email workflows via Manyreach.
*   **Core Infrastructure (Current Focus):** Next.js (App Router) frontend, Supabase database, and bi-directional webhook pipelines.

---

## 1. Omnichannel Database Schema (Supabase)

The database is structured to separate the core lead profile from the timeline of interactions, allowing emails, future cold calls (Vapi), and DMs to live in a single unified thread.

```sql
-- 1. Multi-tenant boundary
CREATE TABLE workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, 
  niche_type TEXT NOT NULL, -- 'dental' or 'legal'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. The Unified Lead Profile
CREATE TABLE marketplace_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  primary_contact TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  lead_status TEXT DEFAULT 'prospecting', -- 'contacted', 'replied', 'meeting_booked'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ
);

-- 3. The Unified Inbox (Interactions)
CREATE TABLE lead_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES marketplace_leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'manyreach', 'vapi', 'linkedin'
  event_type TEXT NOT NULL, -- 'sent', 'replied', 'call_completed'
  content TEXT, 
  metadata JSONB, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Webhook & API Architecture

The Next.js application acts as the bridge between the sourcing team's data and the Manyreach sequencing engine.

### A. Outbound Pipeline (Next.js -> Manyreach)
*   **Trigger:** User uploads a CSV of sourced leads via the frontend Drag-and-Drop zone.
*   **Action:** A Next.js Server Action (`'use server'`) parses the CSV and pushes the data directly to the Manyreach REST API to initiate the campaign, while simultaneously creating `marketplace_leads` records in Supabase.

### B. Inbound Pipeline (Manyreach -> Next.js)
*   **Trigger:** A prospect replies to a Manyreach email.
*   **Action:** Manyreach fires a payload to a Next.js API Route (`app/api/webhooks/manyreach/route.ts`).
*   **Processing:** The API route verifies the webhook signature, extracts the email body, and inserts a new row into `lead_interactions` with `event_type = 'replied'`, triggering a real-time UI update in the Marketplace.

---

## 3. Frontend Architecture (Next.js + Tailwind + shadcn/ui)

*   **The Omnichannel Kanban Board:** The default Marketplace view displaying leads categorized by status columns (Prospecting, Contacted, Replied, Booked).
*   **The Unified Thread View:** A slide-out side panel triggered by clicking a lead card. It fetches the `lead_interactions` table to display a chronological timeline of all touches (Manyreach emails, future Vapi call transcripts, DMs).
*   **Sourcing Upload Zone:** A dedicated UI component for teammates to drop CSV files of new leads to automatically sync with Supabase and Manyreach.
