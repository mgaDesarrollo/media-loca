import { sql } from '../lib/db'

async function runMigration() {
  try {
    console.log('Agregando campo payment_method a la tabla orders...')
    await sql`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT
    `
    console.log('✅ Migración completada exitosamente')
  } catch (error) {
    console.error('❌ Error al ejecutar la migración:', error)
    process.exit(1)
  }
}

runMigration()
