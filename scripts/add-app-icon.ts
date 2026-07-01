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
  console.log('Adding app_icon column to profile_config...')
  await sql`ALTER TABLE profile_config ADD COLUMN IF NOT EXISTS app_icon TEXT;`
  console.log('✅ app_icon column added successfully')
}

run().catch(console.error)
