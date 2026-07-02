import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env', override: true })

async function run() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada')
    process.exit(1)
  }
  const sql = neon(databaseUrl)
  const rows = await sql`SELECT id, store_name, app_icon FROM profile_config ORDER BY created_at ASC`
  console.log('Rows found:', rows.length)
  for (const row of rows) {
    console.log(`ID: ${row.id}, Name: ${row.store_name}, HasIcon: ${!!row.app_icon}`)
    if (row.app_icon) {
      console.log('Icon prefix:', row.app_icon.substring(0, 100))
    }
  }
}

run().catch(console.error)
