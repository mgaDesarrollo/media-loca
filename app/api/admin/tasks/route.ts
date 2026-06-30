import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import {
  getTaskNotes,
  createTaskNote,
  updateTaskNote,
  deleteTaskNote,
} from '@/lib/db/queries'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const notes = await getTaskNotes(session.user.id)
    return Response.json(notes)
  } catch (error) {
    console.error('Error fetching task notes:', error)
    return Response.json({ error: 'Error al obtener tareas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { title, color } = await request.json()
    if (!title) {
      return Response.json({ error: 'El título es requerido' }, { status: 400 })
    }

    const note = await createTaskNote(session.user.id, title, color || 'default')
    return Response.json(note)
  } catch (error) {
    console.error('Error creating task note:', error)
    return Response.json({ error: 'Error al crear tarea' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id, title, items, color } = await request.json()
    if (!id || !title) {
      return Response.json({ error: 'ID y título son requeridos' }, { status: 400 })
    }

    const note = await updateTaskNote(id, session.user.id, title, items || [], color || 'default')
    return Response.json(note)
  } catch (error) {
    console.error('Error updating task note:', error)
    return Response.json({ error: 'Error al actualizar tarea' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'El ID es requerido' }, { status: 400 })
    }

    const note = await deleteTaskNote(id, session.user.id)
    return Response.json({ success: true, note })
  } catch (error) {
    console.error('Error deleting task note:', error)
    return Response.json({ error: 'Error al eliminar tarea' }, { status: 500 })
  }
}
