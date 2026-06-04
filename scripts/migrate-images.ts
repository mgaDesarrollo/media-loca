import { readdir, readFile } from 'fs/promises'
import { put } from '@vercel/blob'
import { neon } from '@neondatabase/serverless'
import path from 'path'
import { config } from 'dotenv'

// Cargar variables de entorno desde .env
config()

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ Error: BLOB_READ_WRITE_TOKEN no está configurado')
  console.error('Por favor configura Vercel Blob Storage primero')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurado')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function migrateImages() {
  console.log('🚀 Iniciando migración de imágenes a Vercel Blob Storage...\n')

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  let migrated = 0
  let errors = 0

  try {
    // Leer archivos de uploads
    const files = await readdir(uploadsDir)
    const imageFiles = files.filter(f => 
      f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
    )

    console.log(`📁 Encontrados ${imageFiles.length} archivos de imagen\n`)

    if (imageFiles.length === 0) {
      console.log('✅ No hay imágenes para migrar')
      return
    }

    for (const file of imageFiles) {
      try {
        console.log(`📤 Procesando ${file}...`)

        // Leer archivo
        const filePath = path.join(uploadsDir, file)
        const fileBuffer = await readFile(filePath)

        // Subir a Vercel Blob
        const blob = await put(`products/${file}`, fileBuffer, {
          access: 'public',
        })

        console.log(`✅ Subido a: ${blob.url}`)

        // Actualizar base de datos
        const oldUrl = `/uploads/${file}`
        const result = await sql`
          UPDATE products 
          SET image_url = ${blob.url}
          WHERE image_url = ${oldUrl}
          RETURNING id
        `

        if (result.length > 0) {
          console.log(`📝 Actualizados ${result.length} productos en la base de datos`)
          migrated++
        } else {
          console.log(`⚠️  No se encontraron productos con esta imagen`)
        }

      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error)
        errors++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Migración completada`)
    console.log(`📊 Resumen:`)
    console.log(`   - Imágenes migradas: ${migrated}`)
    console.log(`   - Errores: ${errors}`)
    console.log(`   - Total procesadas: ${imageFiles.length}`)
    console.log('='.repeat(50))

    if (migrated > 0) {
      console.log('\n💡 Puedes borrar la carpeta public/uploads/ localmente')
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.log('✅ La carpeta public/uploads/ no existe o está vacía')
    } else {
      console.error('❌ Error durante la migración:', error)
      process.exit(1)
    }
  }
}

migrateImages()
