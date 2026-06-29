import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config()

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurado')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function fixOrderItemsFk() {
  console.log('🔧 Arreglando foreign key de order_items.product_id...\n')

  try {
    // Eliminar constraint existente
    await sql`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey`
    console.log('✅ Constraint anterior eliminado')

    // Recrear con ON DELETE SET NULL
    await sql`
      ALTER TABLE order_items
        ADD CONSTRAINT order_items_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
    `
    console.log('✅ Nuevo constraint creado con ON DELETE SET NULL')
    console.log('\n🎉 Listo! Ahora podés borrar productos aunque tengan pedidos asociados.')
    console.log('   Los pedidos mantienen su historial (product_id quedará en NULL).')
  } catch (error) {
    console.error('❌ Error al aplicar migración:', error)
    process.exit(1)
  }
}

fixOrderItemsFk()
