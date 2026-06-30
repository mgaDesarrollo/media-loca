import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config()

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const rows = await sql`SELECT * FROM promotion_config ORDER BY min_pairs ASC`
  console.log(JSON.stringify(rows, null, 2))
}

main().catch(console.error)
