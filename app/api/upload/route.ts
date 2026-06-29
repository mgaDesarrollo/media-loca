import { put } from '@vercel/blob'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verificar token antes de continuar
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[upload] BLOB_READ_WRITE_TOKEN no configurado en el entorno')
    return Response.json({
      error: 'El servidor no está configurado para subir imágenes. Configurá la variable BLOB_READ_WRITE_TOKEN en el dashboard de Vercel y redesplegá el proyecto.',
      needsBlobStorage: true
    }, { status: 503 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'Archivo inválido' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}.${ext}`

  console.log(`[upload] Subiendo archivo: ${fileName}, tamaño: ${file.size} bytes`)

  try {
    const blob = await put(`products/${fileName}`, file, { access: 'public' })
    console.log(`[upload] ✓ Subido exitosamente: ${blob.url}`)
    return Response.json({ url: blob.url })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[upload] Error al subir a Vercel Blob:', errMsg)
    return Response.json({
      error: `Error al subir imagen: ${errMsg}`
    }, { status: 500 })
  }
}
