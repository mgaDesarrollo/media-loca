'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Edit, Package, AlertTriangle, XCircle, CheckCircle, TrendingUp } from 'lucide-react'
import type { Product } from '@/lib/types'

interface StockManagerProps {
  products: Product[]
}

export function StockManager({ products }: StockManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    stock: '',
    adjustment_reason: '',
  })

  // Agrupar productos por estado de stock
  const outOfStock = products.filter(p => p.stock === 0)
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 2)
  const okStock = products.filter(p => p.stock >= 2)

  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  const resetForm = () => {
    setFormData({
      stock: '',
      adjustment_reason: '',
    })
    setEditingStock(null)
  }

  const openEditDialog = (product: Product) => {
    setEditingStock(product)
    setFormData({
      stock: product.stock.toString(),
      adjustment_reason: '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newStock = parseInt(formData.stock)
    const oldStock = editingStock?.stock || 0
    const adjustment = newStock - oldStock

    const { error } = await supabase
      .from('products')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingStock?.id)

    if (error) {
      toast.error('Error al actualizar stock')
      setLoading(false)
      return
    }

    // Registrar ajuste de stock (opcional: podrías crear una tabla para esto)
    if (formData.adjustment_reason) {
      console.log(`Ajuste de stock: ${editingStock?.name} - ${oldStock} → ${newStock} (${adjustment > 0 ? '+' : ''}${adjustment}) - ${formData.adjustment_reason}`)
    }

    toast.success(`Stock actualizado: ${adjustment > 0 ? '+' : ''}${adjustment} unidades`)
    setLoading(false)
    setIsDialogOpen(false)
    resetForm()
    window.location.reload() // Recargar para actualizar los datos
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const StockCard = ({ 
    title, 
    products, 
    icon: Icon, 
    color, 
    bgColor, 
    borderColor 
  }: {
    title: string
    products: Product[]
    icon: any
    color: string
    bgColor: string
    borderColor: string
  }) => (
    <Card className={`${bgColor} ${borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className={color}>
            {products.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay productos</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.categories?.name} • {formatPrice(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    Stock: {product.stock}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Package className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Total Productos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-sm text-muted-foreground">En catálogo</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Stock OK</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{okStock.length}</div>
            <p className="text-sm text-muted-foreground">≥ 2 unidades</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Stock Bajo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStock.length}</div>
            <p className="text-sm text-muted-foreground">&lt; 2 unidades</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <XCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Sin Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStock.length}</div>
            <p className="text-sm text-muted-foreground">0 unidades</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalle por Categoría */}
      <div className="grid gap-6 md:grid-cols-3">
        <StockCard
          title="Stock OK"
          products={okStock}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
        
        <StockCard
          title="Stock Bajo"
          products={lowStock}
          icon={AlertTriangle}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
        />
        
        <StockCard
          title="Sin Stock"
          products={outOfStock}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
      </div>

      {/* Diálogo de Edición */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock</DialogTitle>
          </DialogHeader>
          {editingStock && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{editingStock.name}</p>
                <p className="text-sm text-muted-foreground">
                  Stock actual: {editingStock.stock} unidades
                </p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="stock">Nuevo Stock</FieldLabel>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </Field>
                  
                  <Field>
                    <FieldLabel htmlFor="adjustment_reason">Motivo del ajuste (opcional)</FieldLabel>
                    <Textarea
                      id="adjustment_reason"
                      value={formData.adjustment_reason}
                      onChange={(e) => setFormData({ ...formData, adjustment_reason: e.target.value })}
                      placeholder="Ej: Corrección de inventario, devolución, daño de producto..."
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
                
                <div className="mt-6 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Spinner className="mr-2" />}
                    Actualizar Stock
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
