'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Upload, Image as ImageIcon } from 'lucide-react'
import type { Product, Category } from '@/lib/types'

interface ProductsManagerProps {
  initialProducts: Product[]
  categories: Category[]
}

export function ProductsManager({ initialProducts, categories }: ProductsManagerProps) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    is_active: true,
    image_url: '',
  })
  const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      is_active: true,
      image_url: '',
    })
    setEditingProduct(null)
    setImageInputType('url')
    setSelectedFile(null)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      is_active: product.is_active,
      image_url: product.image_url || '',
    })
    setImageInputType(product.image_url ? 'url' : 'file')
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let imageUrl = formData.image_url
    
    // Si es un archivo, subirlo primero
    if (imageInputType === 'file' && selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      console.log('Subiendo archivo:', fileName, 'Tipo:', fileExt, 'Tamaño:', selectedFile.size)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, selectedFile)
      
      console.log('Resultado upload:', { uploadData, uploadError })
      
      if (uploadError) {
        console.error('Error detallado:', uploadError)
        toast.error(`Error al subir imagen: ${uploadError.message}`)
        setLoading(false)
        return
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)
      
      console.log('URL pública:', publicUrl)
      imageUrl = publicUrl
    }

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category_id: formData.category_id || null,
      is_active: formData.is_active,
      image_url: imageUrl || null,
      updated_at: new Date().toISOString(),
    }

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)

      if (error) {
        toast.error('Error al actualizar producto')
        setLoading(false)
        return
      }
      toast.success('Producto actualizado')
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData)

      if (error) {
        toast.error('Error al crear producto')
        setLoading(false)
        return
      }
      toast.success('Producto creado')
    }

    setLoading(false)
    setIsDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Estas seguro de eliminar este producto?')) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      toast.error('Error al eliminar producto')
      return
    }

    setProducts(products.filter((p) => p.id !== productId))
    toast.success('Producto eliminado')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Medias Arcoiris"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Descripcion</FieldLabel>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Medias coloridas con diseno de arcoiris..."
                    rows={3}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="price">Precio</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="2500"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="stock">Stock</FieldLabel>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="category">Categoria</FieldLabel>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Imagen del producto</FieldLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={imageInputType === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageInputType('url')}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={imageInputType === 'file' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setImageInputType('file')}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Archivo
                      </Button>
                    </div>
                    
                    {imageInputType === 'url' ? (
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    ) : (
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) setSelectedFile(file)
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Field>
                <Field className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FieldLabel htmlFor="is_active" className="mb-0">Activo</FieldLabel>
                    <p className="text-sm text-muted-foreground">
                      Mostrar en el catalogo publico
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </Field>
              </FieldGroup>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Spinner className="mr-2" />}
                  {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const isLowStock = product.stock > 0 && product.stock < 2
          const isOutOfStock = product.stock === 0
          
          return (
            <Card 
              key={product.id} 
              className={`${
                !product.is_active ? 'opacity-60' : ''
              } ${
                isOutOfStock ? 'bg-red-50 border-red-200' : 
                isLowStock ? 'bg-yellow-50 border-yellow-200' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {/* Miniatura de imagen */}
                  <div className="flex-shrink-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.jpg'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg border flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">{product.name}</CardTitle>
                        {product.categories && (
                          <Badge variant="secondary" className="mt-1">
                            {product.categories.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                    {isOutOfStock && (
                      <Badge variant="destructive" className="text-xs">
                        Sin stock
                      </Badge>
                    )}
                    {isLowStock && (
                      <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                        Stock bajo
                      </Badge>
                    )}
                  </div>
                </div>
                {!product.is_active && (
                  <Badge variant="outline" className="mt-2">
                    Inactivo
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No hay productos</p>
        </div>
      )}
    </div>
  )
}
