CREATE TABLE "call_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text,
	"vapi_call_id" text,
	"customer_number" text,
	"call_direction" text,
	"duration" text,
	"call_status" text,
	"transcript" jsonb,
	"summary" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "marketplace_leads" ADD COLUMN "disposition" text;--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;