import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

// ==========================================
// 1. Auth.js Standard Schema
// ==========================================

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: text("role").default("admin"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
)

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
)

// ==========================================
// 2. CRM Multi-Tenant Domain Schema
// ==========================================

export const workspaces = pgTable("workspaces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  nicheType: text("niche_type").notNull(), // 'legal' | 'dental'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const marketplaceLeads = pgTable("marketplace_leads", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  companyName: text("company_name").notNull(),
  primaryContact: text("primary_contact"),
  email: text("email"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  leadStatus: text("lead_status").default("prospecting"), // 'prospecting' | 'contacted' | 'replied' | 'booked'
  callCategory: text("call_category"), // industry-specific categorization (e.g. 'Matter Type' for law, 'Service Requested' for dental)
  channel: text("channel").default("manyreach"), // 'manyreach' | 'linkedin' | 'vapi'
  lastInteractionAt: timestamp("last_interaction_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const leadInteractions = pgTable("lead_interactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leadId: text("lead_id").references(() => marketplaceLeads.id, {
    onDelete: "cascade",
  }),
  channel: text("channel").notNull(), // 'manyreach' | 'vapi' | 'linkedin'
  eventType: text("event_type").notNull(), // 'sent' | 'replied' | 'call_completed'
  content: text("content"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const callLogs = pgTable("call_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  vapiCallId: text("vapi_call_id"),
  customerNumber: text("customer_number"),
  callDirection: text("call_direction"),
  duration: text("duration"),
  callStatus: text("call_status"), // 'Converted' | 'Not Converted' | 'Unknown'
  callCategory: text("call_category"), // industry-specific category
  transcript: jsonb("transcript"),
  summary: text("summary"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})
