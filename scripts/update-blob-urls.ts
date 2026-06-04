import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config()

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurado')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function updateBlobUrls() {
  console.log('🔄 Actualizando URLs de Blob Storage en la base de datos...\n')

  const oldStore = '634dy225jucj2cbf.private.blob.vercel-storage.com'
  const newStore = 'aG5mCzwaDfHCJXuT.public.blob.vercel-storage.com'

  const result = await sql`
    UPDATE products 
    SET image_url = REPLACE(image_url, ${oldStore}, ${newStore})
    WHERE image_url LIKE ${`%${oldStore}%`}
    RETURNING id, name, image_url
  `

  console.log(`✅ Actualizados ${result.length} productos:\n`)

  for (const product of result) {
    console.log(`ID: ${product.id}`)
    console.log(`Nombre: ${product.name}`)
    console.log(`Nueva URL: ${product.image_url}`)
    console.log('---')
  }

  console.log(`\n📊 Total actualizados: ${result.length}`)
}

updateBlobUrls()
