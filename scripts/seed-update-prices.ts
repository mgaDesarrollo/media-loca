import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env', override: true })

async function updateAllPrices() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada en .env')
    process.exit(1)
  }

  const newPrice = 4400
  const sql = neon(databaseUrl)

  // Actualizar todos los precios
  const result = await sql`
    UPDATE products 
    SET price = ${newPrice}, updated_at = NOW()
    WHERE is_active = true
    RETURNING id, name, price
  `

  console.log(`✅ ${result.length} productos actualizados a precio $${newPrice}`)
  
  // Mostrar los productos actualizados
  result.forEach((product: any) => {
    console.log(`   - ${product.name}: $${product.price}`)
  })
}

updateAllPrices().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
