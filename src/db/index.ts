import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "postgresql://neondb_owner:npg_ZIsrDVqAo0w5@ep-wispy-cell-aegpacsg-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

const sql = neon(connectionString)

export const db = drizzle(sql, { schema })
