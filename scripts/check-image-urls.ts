import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config()

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurado')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function checkImageUrls() {
  console.log('🔍 Consultando URLs de imágenes en la base de datos...\n')

  const products = await sql`
    SELECT id, name, image_url 
    FROM products 
    WHERE image_url IS NOT NULL 
    LIMIT 10
  `

  console.log(`📊 Encontrados ${products.length} productos con imágenes:\n`)

  for (const product of products) {
    console.log(`ID: ${product.id}`)
    console.log(`Nombre: ${product.name}`)
    console.log(`URL: ${product.image_url}`)
    console.log('---')
  }
}

checkImageUrls()
