import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  try {
    console.log('Adding carousel_images column to profile_config...')
    await sql`
      ALTER TABLE profile_config 
      ADD COLUMN IF NOT EXISTS carousel_images JSONB DEFAULT '[]'::jsonb
    `
    console.log('Column added successfully!')
  } catch (err) {
    console.error('Error running migration:', err)
    process.exit(1)
  }
}

main()
