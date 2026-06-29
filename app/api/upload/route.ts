import { put } from '@vercel/blob'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'Archivo inválido' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}.${ext}`

  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
  console.log(`[upload] hasBlobToken=${hasBlobToken}, fileName=${fileName}, fileSize=${file.size}`)

  if (hasBlobToken) {
    try {
      const blob = await put(`products/${fileName}`, file, { access: 'public' })
      console.log(`[upload] Success: ${blob.url}`)
      return Response.json({ url: blob.url })
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error('[upload] Error uploading to Vercel Blob:', errMsg)
      return Response.json({ 
        error: `Error al subir imagen a Vercel Blob: ${errMsg}` 
      }, { status: 500 })
    }
  }

  // Fallback: filesystem local (solo funciona en development)
  console.warn('[upload] BLOB_READ_WRITE_TOKEN no configurado, intentando filesystem local')
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadsDir, fileName), buffer)
    return Response.json({ url: `/uploads/${fileName}` })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[upload] Error saving to local filesystem:', errMsg)
    return Response.json({ 
      error: 'BLOB_READ_WRITE_TOKEN no está configurado en Vercel. Configurá la variable de entorno en el dashboard de Vercel.',
      detail: errMsg,
      needsBlobStorage: true
    }, { status: 500 })
  }
}
