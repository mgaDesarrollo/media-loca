'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Save,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface TaskItem {
  id: string
  text: string
  completed: boolean
}

interface TaskNote {
  id: string
  title: string
  items: TaskItem[]
  color: string
  createdAt: string
  isEditing: boolean
}

const colorOptions = [
  { value: 'default', label: 'Por defecto', bgClass: 'bg-card', borderClass: 'border-border' },
  { value: 'red', label: 'Rojo', bgClass: 'bg-red-50 dark:bg-red-950', borderClass: 'border-red-200 dark:border-red-800' },
  { value: 'orange', label: 'Naranja', bgClass: 'bg-orange-50 dark:bg-orange-950', borderClass: 'border-orange-200 dark:border-orange-800' },
  { value: 'yellow', label: 'Amarillo', bgClass: 'bg-yellow-50 dark:bg-yellow-950', borderClass: 'border-yellow-200 dark:border-yellow-800' },
  { value: 'green', label: 'Verde', bgClass: 'bg-green-50 dark:bg-green-950', borderClass: 'border-green-200 dark:border-green-800' },
  { value: 'blue', label: 'Azul', bgClass: 'bg-blue-50 dark:bg-blue-950', borderClass: 'border-blue-200 dark:border-blue-800' },
  { value: 'purple', label: 'Púrpura', bgClass: 'bg-purple-50 dark:bg-purple-950', borderClass: 'border-purple-200 dark:border-purple-800' },
  { value: 'pink', label: 'Rosa', bgClass: 'bg-pink-50 dark:bg-pink-950', borderClass: 'border-pink-200 dark:border-pink-800' },
]

export function TasksDashboard() {
  const [notes, setNotes] = useState<TaskNote[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load notes from DB
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/admin/tasks')
        if (response.ok) {
          const data = await response.json()
          setNotes(data.map((note: any) => ({ ...note, isEditing: false })))
        }
      } catch (error) {
        console.error('Error loading notes:', error)
        toast.error('Error al cargar las tareas')
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotes()
  }, [])

  const saveNoteOnBackend = async (updatedNote: TaskNote) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedNote.id,
          title: updatedNote.title,
          items: updatedNote.items,
          color: updatedNote.color,
        }),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      setNotes(prev => prev.map(n => n.id === saved.id ? { ...saved, isEditing: n.isEditing } : n))
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error('Error al guardar cambios')
    }
  }

  const createNote = async () => {
    if (!newNoteTitle.trim()) {
      toast.error('Ingresa un título para la nota')
      return
    }

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newNoteTitle, color: 'default' }),
      })
      if (!res.ok) throw new Error()
      const newNote = await res.json()
      setNotes([...notes, { ...newNote, isEditing: false }])
      setNewNoteTitle('')
      setIsCreating(false)
      toast.success('Nota creada')
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Error al crear la nota')
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tasks?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      setNotes(notes.filter(note => note.id !== id))
      toast.success('Nota eliminada')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Error al eliminar la nota')
    }
  }

  const updateNoteTitle = (id: string, newTitle: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, title: newTitle } : note
    ))
  }

  const updateNoteColor = (id: string, newColor: string) => {
    const noteToUpdate = notes.find(n => n.id === id)
    if (!noteToUpdate) return
    const updated = { ...noteToUpdate, color: newColor }
    setNotes(notes.map(n => n.id === id ? updated : n))
    saveNoteOnBackend(updated)
  }

  const addItem = (noteId: string, text: string) => {
    if (!text.trim()) return
    const noteToUpdate = notes.find(n => n.id === noteId)
    if (!noteToUpdate) return

    const newItem: TaskItem = {
      id: Date.now().toString(),
      text,
      completed: false,
    }

    const updated = { ...noteToUpdate, items: [...noteToUpdate.items, newItem] }
    setNotes(notes.map(n => n.id === noteId ? updated : n))
    saveNoteOnBackend(updated)
  }

  const toggleItem = (noteId: string, itemId: string) => {
    const noteToUpdate = notes.find(n => n.id === noteId)
    if (!noteToUpdate) return

    const updated = {
      ...noteToUpdate,
      items: noteToUpdate.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }
    setNotes(notes.map(n => n.id === noteId ? updated : n))
    saveNoteOnBackend(updated)
  }

  const updateItemText = (noteId: string, itemId: string, newText: string) => {
    setNotes(notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            items: note.items.map(item =>
              item.id === itemId ? { ...item, text: newText } : item
            ),
          }
        : note
    ))
  }

  const deleteItem = (noteId: string, itemId: string) => {
    const noteToUpdate = notes.find(n => n.id === noteId)
    if (!noteToUpdate) return

    const updated = {
      ...noteToUpdate,
      items: noteToUpdate.items.filter(item => item.id !== itemId),
    }
    setNotes(notes.map(n => n.id === noteId ? updated : n))
    saveNoteOnBackend(updated)
  }

  const getCompletedCount = (note: TaskNote) => {
    return note.items.filter(item => item.completed).length
  }

  const getProgress = (note: TaskNote) => {
    if (note.items.length === 0) return 0
    return (getCompletedCount(note) / note.items.length) * 100
  }

  const getColorClasses = (color: string) => {
    const option = colorOptions.find(opt => opt.value === color)
    return {
      bg: option?.bgClass || 'bg-card',
      border: option?.borderClass || 'border-border',
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-muted-foreground text-sm">Cargando tus tareas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Note Button */}
      {!isCreating ? (
        <Button
          onClick={() => setIsCreating(true)}
          className="w-full sm:w-auto gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Crear nueva nota
        </Button>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="p-4 space-y-4">
            <Input
              placeholder="Título de la nota..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createNote()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={createNote} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Crear
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setNewNoteTitle('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => {
          const colorClasses = getColorClasses(note.color)
          const completedCount = getCompletedCount(note)
          const progress = getProgress(note)

          return (
            <Card
              key={note.id}
              className={`${colorClasses.bg} ${colorClasses.border} border-2 hover:shadow-lg transition-shadow`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {note.isEditing ? (
                      <Input
                        value={note.title}
                        onChange={(e) => updateNoteTitle(note.id, e.target.value)}
                        className="text-lg font-semibold h-8"
                        autoFocus
                      />
                    ) : (
                      <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setNotes(notes.map(n => {
                          if (n.id === note.id) {
                            const nextEditing = !n.isEditing
                            if (!nextEditing) {
                              saveNoteOnBackend(n)
                            }
                            return { ...n, isEditing: nextEditing }
                          }
                          return n
                        }))
                      }
                    >
                      {note.isEditing ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Edit2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Color Selector */}
                <Select
                  value={note.color}
                  onValueChange={(value) => updateNoteColor(note.id, value)}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Progress */}
                {note.items.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{completedCount}/{note.items.length} completadas</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-2">
                {/* Add Item */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar item..."
                    className="flex-1 h-9"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addItem(note.id, e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input')
                      if (input) {
                        addItem(note.id, input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {note.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-background/50 hover:bg-background transition-colors"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                          item.completed
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => toggleItem(note.id, item.id)}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 rounded border-2 border-current" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            item.completed
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {item.text}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 text-destructive hover:text-destructive"
                        onClick={() => deleteItem(note.id, item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {note.items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Sin items aún</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {notes.length === 0 && !isCreating && (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No tienes notas aún</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea tu primera nota para empezar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
