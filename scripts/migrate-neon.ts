import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env', override: true })

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada en .env')
    process.exit(1)
  }

  const sql = neon(databaseUrl)
  const schema = readFileSync('lib/neon/schema.sql', 'utf8')

  const statements = schema
    .split(';')
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter((s) => s.length > 0)

  console.log(`🔧 Ejecutando ${statements.length} statements en Neon...`)

  for (const statement of statements) {
    await sql.query(statement)
  }

  console.log('✅ Esquema creado correctamente')
}

migrate().catch((error) => {
  console.error('❌ Error en migración:', error)
  process.exit(1)
})
