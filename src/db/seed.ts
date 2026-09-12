import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
dotenv.config()

async function seed() {
  const connectionString =
    process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED

  if (!connectionString) {
    console.error("DATABASE_URL not set")
    process.exit(1)
  }

  const sql = neon(connectionString)
  const db = drizzle(sql, { schema })

  console.log("Seeding Neon database...")

  // 1. Workspaces
  await db
    .insert(schema.workspaces)
    .values({
      name: "Law Firms",
      nicheType: "legal",
    })
    .onConflictDoNothing()

  await db
    .insert(schema.workspaces)
    .values({
      name: "Dental Clinics",
      nicheType: "dental",
    })
    .onConflictDoNothing()

  console.log("✓ Workspaces seeded")

  // 2. Demo Users (for reference - auth is handled by JWT, not DB)
  const demoUsers = [
    { id: "user-superadmin-1", name: "Super Admin", email: "admin@crm.com", role: "SUPERADMIN" },
    { id: "user-legal", name: "Legal Intake", email: "legal@omnireach.com", role: "USER" },
    { id: "user-dental", name: "Dental Clinic", email: "dental@omnireach.com", role: "USER" },
  ]

  for (const user of demoUsers) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoNothing()
  }

  console.log("✓ Demo users seeded")
  console.log("✓ Database seeding complete!")
}

seed().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
