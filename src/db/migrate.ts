import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
dotenv.config()

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED

  if (!connectionString) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
  }

  const sql = neon(connectionString)
  const migrationPath = path.join(process.cwd(), "drizzle", "0000_broken_hellcat.sql")
  const migrationSql = fs.readFileSync(migrationPath, "utf-8")

  console.log("Applying migration to Neon Postgres...")
  
  // Split statements and execute
  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await sql.query(statement)
  }

  console.log("✓ All 7 tables and foreign keys successfully applied to Neon Postgres!")
}

runMigration().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
