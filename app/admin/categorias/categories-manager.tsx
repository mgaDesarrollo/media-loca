'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCategory, upsertCategory, deleteTag, upsertTag } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Tag as TagIcon, Hash } from 'lucide-react'
import type { Category, Tag } from '@/lib/types'

interface CategoriesManagerProps {
  initialCategories: Category[]
  initialTags: Tag[]
}

const PRESET_COLORS = [
  { name: 'Rojo', hex: '#f43f5e' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Celeste', hex: '#06b6d4' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Violeta', hex: '#8b5cf6' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Gris', hex: '#6b7280' },
]

export function CategoriesManager({ initialCategories, initialTags }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [tags, setTags] = useState(initialTags)
  
  const [searchCategories, setSearchCategories] = useState('')
  const [searchTags, setSearchTags] = useState('')

  // Dialog Category
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [catLoading, setCatLoading] = useState(false)
  const [catFormData, setCatFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })

  // Dialog Tag
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [tagLoading, setTagLoading] = useState(false)
  const [tagFormData, setTagFormData] = useState({
    name: '',
    color: '#3b82f6',
    is_active: true,
  })

  const router = useRouter()

  // Filter lists
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchCategories.toLowerCase())
  )

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchTags.toLowerCase())
  )

  // Category Actions
  const resetCatForm = () => {
    setCatFormData({
      name: '',
      description: '',
      is_active: true,
    })
    setEditingCategory(null)
  }

  const openEditCatDialog = (category: Category) => {
    setEditingCategory(category)
    setCatFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    })
    setIsCatDialogOpen(true)
  }

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCatLoading(true)

    try {
      await upsertCategory({
        id: editingCategory?.id,
        name: catFormData.name,
        description: catFormData.description || null,
        is_active: catFormData.is_active,
      })
      toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada')
      
      // Update UI state
      if (editingCategory) {
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...catFormData, description: catFormData.description || null } : c))
      } else {
        router.refresh()
      }
    } catch {
      toast.error(editingCategory ? 'Error al actualizar categoría' : 'Error al crear categoría')
      setCatLoading(false)
      return
    }

    setCatLoading(false)
    setIsCatDialogOpen(false)
    resetCatForm()
    setTimeout(() => router.refresh(), 100)
  }

  const handleCatDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return

    try {
      await deleteCategory(categoryId)
      setCategories(categories.filter((c) => c.id !== categoryId))
      toast.success('Categoría eliminada')
    } catch {
      toast.error('Error al eliminar categoría')
    }
  }

  // Tag Actions
  const resetTagForm = () => {
    setTagFormData({
      name: '',
      color: '#3b82f6',
      is_active: true,
    })
    setEditingTag(null)
  }

  const openEditTagDialog = (tag: Tag) => {
    setEditingTag(tag)
    setTagFormData({
      name: tag.name,
      color: tag.color || '#3b82f6',
      is_active: tag.is_active,
    })
    setIsTagDialogOpen(true)
  }

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTagLoading(true)

    try {
      await upsertTag({
        id: editingTag?.id,
        name: tagFormData.name,
        color: tagFormData.color,
        is_active: tagFormData.is_active,
      })
      toast.success(editingTag ? 'Etiqueta actualizada' : 'Etiqueta creada')
      
      if (editingTag) {
        setTags(tags.map(t => t.id === editingTag.id ? { ...t, ...tagFormData } : t))
      } else {
        router.refresh()
      }
    } catch {
      toast.error(editingTag ? 'Error al actualizar etiqueta' : 'Error al crear etiqueta')
      setTagLoading(false)
      return
    }

    setTagLoading(false)
    setIsTagDialogOpen(false)
    resetTagForm()
    setTimeout(() => router.refresh(), 100)
  }

  const handleTagDelete = async (tagId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta etiqueta? Se quitará de todos los productos.')) return

    try {
      await deleteTag(tagId)
      setTags(tags.filter((t) => t.id !== tagId))
      toast.success('Etiqueta eliminada')
    } catch {
      toast.error('Error al eliminar etiqueta')
    }
  }

  return (
    <Tabs defaultValue="categories" className="w-full space-y-6">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="categories" className="gap-2">
          <TagIcon className="h-4 w-4" />
          Categorías
        </TabsTrigger>
        <TabsTrigger value="tags" className="gap-2">
          <Hash className="h-4 w-4" />
          Etiquetas
        </TabsTrigger>
      </TabsList>

      {/* CATEGORIES TAB */}
      <TabsContent value="categories" className="space-y-4 outline-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
              value={searchCategories}
              onChange={(e) => setSearchCategories(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isCatDialogOpen} onOpenChange={(open) => {
            setIsCatDialogOpen(open)
            if (!open) resetCatForm()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory ? 'Edita los detalles de la categoría existente' : 'Crea una nueva categoría para organizar productos'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCatSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="cat_name">Nombre</FieldLabel>
                    <Input
                      id="cat_name"
                      value={catFormData.name}
                      onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                      placeholder="Ej: Medias Deportivas"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cat_description">Descripción</FieldLabel>
                    <Textarea
                      id="cat_description"
                      value={catFormData.description}
                      onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                      placeholder="Medias ideales para actividades deportivas..."
                      rows={3}
                    />
                  </Field>
                  <Field className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FieldLabel htmlFor="cat_is_active" className="mb-0">Activa</FieldLabel>
                      <p className="text-sm text-muted-foreground">
                        Mostrar en el catálogo público
                      </p>
                    </div>
                    <Switch
                      id="cat_is_active"
                      checked={catFormData.is_active}
                      onCheckedChange={(checked) => setCatFormData({ ...catFormData, is_active: checked })}
                    />
                  </Field>
                </FieldGroup>
                <div className="mt-6 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCatDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={catLoading}>
                    {catLoading && <Spinner className="mr-2" />}
                    {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className={!category.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TagIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditCatDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleCatDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!category.is_active && (
                  <Badge variant="outline" className="mt-1">
                    Inactiva
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No hay categorías</p>
          </div>
        )}
      </TabsContent>

      {/* TAGS TAB */}
      <TabsContent value="tags" className="space-y-4 outline-none">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar etiquetas..."
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isTagDialogOpen} onOpenChange={(open) => {
            setIsTagDialogOpen(open)
            if (!open) resetTagForm()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Etiqueta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
                </DialogTitle>
                <DialogDescription>
                  {editingTag ? 'Edita los detalles de la etiqueta existente' : 'Crea una nueva etiqueta para tus productos (ej: Top Ventas, Nuevo)'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTagSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="tag_name">Nombre</FieldLabel>
                    <Input
                      id="tag_name"
                      value={tagFormData.name}
                      onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                      placeholder="Ej: Top Ventas"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Color de la Etiqueta</FieldLabel>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((col) => (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() => setTagFormData({ ...tagFormData, color: col.hex })}
                            style={{ backgroundColor: col.hex }}
                            className={`h-7 w-7 rounded-full border-2 transition-transform ${
                              tagFormData.color.toLowerCase() === col.hex.toLowerCase()
                                ? 'border-foreground scale-110 shadow-md'
                                : 'border-transparent hover:scale-105'
                            }`}
                            title={col.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={tagFormData.color}
                          onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                          className="h-8 w-12 cursor-pointer p-0"
                        />
                        <Input
                          type="text"
                          value={tagFormData.color}
                          onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                          placeholder="#3b82f6"
                          className="max-w-[120px] text-xs font-mono"
                        />
                      </div>
                    </div>
                  </Field>
                  <Field className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FieldLabel htmlFor="tag_is_active" className="mb-0">Activa</FieldLabel>
                      <p className="text-sm text-muted-foreground">
                        Mostrar insignia en el catálogo público
                      </p>
                    </div>
                    <Switch
                      id="tag_is_active"
                      checked={tagFormData.is_active}
                      onCheckedChange={(checked) => setTagFormData({ ...tagFormData, is_active: checked })}
                    />
                  </Field>
                </FieldGroup>
                <div className="mt-6 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={tagLoading}>
                    {tagLoading && <Spinner className="mr-2" />}
                    {editingTag ? 'Guardar cambios' : 'Crear etiqueta'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTags.map((tag) => (
            <Card key={tag.id} className={!tag.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      <Hash className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {tag.name}
                        <span 
                          className="h-3.5 w-3.5 rounded-full inline-block border" 
                          style={{ backgroundColor: tag.color }}
                        />
                      </CardTitle>
                      <p className="text-xs font-mono text-muted-foreground">
                        {tag.color}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditTagDialog(tag)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleTagDelete(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Badge style={{ backgroundColor: tag.color }} className="text-white border-none font-semibold">
                  {tag.name}
                </Badge>
                {!tag.is_active && (
                  <Badge variant="outline">
                    Inactiva
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTags.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No hay etiquetas creadas</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
