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

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`products/${fileName}`, file, { access: 'public' })
      return Response.json({ url: blob.url })
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error)
      return Response.json({ error: 'Error al subir imagen a Vercel Blob' }, { status: 500 })
    }
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadsDir, fileName), buffer)
    return Response.json({ url: `/uploads/${fileName}` })
  } catch (error) {
    console.error('Error saving to local filesystem:', error)
    return Response.json({ 
      error: 'No se puede guardar la imagen. Configura Vercel Blob Storage para producción.',
      needsBlobStorage: true
    }, { status: 500 })
  }
}
