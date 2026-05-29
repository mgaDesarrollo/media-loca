import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env', override: true })

async function seedAdmin() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada en .env')
    process.exit(1)
  }

  const email = process.env.ADMIN_EMAIL ?? 'profile.curriculum@gmail.com'
  const password = process.env.ADMIN_PASSWORD ?? 'Mamichul4'
  const sql = neon(databaseUrl)
  const passwordHash = await bcrypt.hash(password, 10)

  await sql`
    INSERT INTO users (email, password_hash, role, name)
    VALUES (${email}, ${passwordHash}, 'admin', 'Administrador')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW()
  `

  console.log('✅ Usuario admin listo:', email)
}

seedAdmin().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
