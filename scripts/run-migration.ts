import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function runMigration() {
  try {
    console.log('Ejecutando migración para crear tabla promotion_config...')

    // Crear tabla
    await sql`
      CREATE TABLE IF NOT EXISTS promotion_config (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        min_pairs INTEGER NOT NULL,
        max_pairs INTEGER NOT NULL,
        price_per_pair DECIMAL(10,2) NOT NULL,
        label TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('Tabla promotion_config creada exitosamente')

    // Insertar datos por defecto
    await sql`
      INSERT INTO promotion_config (min_pairs, max_pairs, price_per_pair, label, is_active) VALUES
      (1, 2, 0, 'Precio normal', true),
      (3, 5, 3800, 'Pack 3-5 pares', true),
      (6, 11, 3500, 'Pack 6-11 pares', true),
      (12, 999999, 3200, 'Pack 12+ pares', true)
      ON CONFLICT DO NOTHING
    `
    console.log('Datos de promociones insertados exitosamente')

    console.log('Migración completada exitosamente')
  } catch (error) {
    console.error('Error ejecutando migración:', error)
    process.exit(1)
  }
}

runMigration()
