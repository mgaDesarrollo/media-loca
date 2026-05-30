'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSale } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'
import type { Product, Sale } from '@/lib/types'

interface SalesManagerProps {
  initialSales: Sale[]
  products: Product[]
}

interface CartItem {
  product: Product
  quantity: number
  customPrice?: number
}

export function SalesManager({ initialSales, products }: SalesManagerProps) {
  const [sales, setSales] = useState(initialSales)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPackMode, setIsPackMode] = useState(false)
  const [packPrice, setPackPrice] = useState('')
  const router = useRouter()

  const addToCart = () => {
    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = cart.find((item) => item.product.id === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + parseInt(quantity) }
            : item
        )
      )
    } else {
      setCart([...cart, { product, quantity: parseInt(quantity) }])
    }

    setSelectedProduct('')
    setQuantity('1')
  }

  const updateCartItemPrice = (productId: string, customPrice: number) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, customPrice }
          : item
      )
    )
  }

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const cartTotal = isPackMode && packPrice 
    ? parseFloat(packPrice)
    : cart.reduce(
        (acc, item) => acc + (item.customPrice || item.product.price) * item.quantity,
        0
      )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }

    if (isPackMode && !packPrice) {
      toast.error('Ingresa el precio del pack')
      return
    }

    setLoading(true)

    try {
      const items = cart.map((item) => {
        const unitPrice = isPackMode && packPrice 
          ? parseFloat(packPrice) / cart.reduce((sum, i) => sum + i.quantity, 0)
          : (item.customPrice || item.product.price)
        
        return {
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          subtotal: unitPrice * item.quantity,
          new_stock: item.product.stock - item.quantity,
        }
      })

      await createSale({
        total: cartTotal,
        notes: notes || null,
        items,
      })
      toast.success('Venta registrada!')
    } catch {
      toast.error('Error al crear la venta')
      setLoading(false)
      return
    }
    setLoading(false)
    setIsDialogOpen(false)
    setCart([])
    setNotes('')
    setIsPackMode(false)
    setPackPrice('')
    router.refresh()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Venta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Modo Pack</p>
                    <p className="text-xs text-muted-foreground">Vender múltiples medias como un pack con precio personalizado</p>
                  </div>
                  <Button
                    type="button"
                    variant={isPackMode ? "default" : "outline"}
                    onClick={() => setIsPackMode(!isPackMode)}
                  >
                    {isPackMode ? "Pack Activado" : "Activar Pack"}
                  </Button>
                </div>

                {/* Pack Price Section */}
                {isPackMode && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Configuración del Pack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Precio Total del Pack</label>
                          <Input
                            type="number"
                            value={packPrice}
                            onChange={(e) => setPackPrice(e.target.value)}
                            placeholder="Precio total del pack"
                            min="0"
                            step="100"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Este precio se aplicará al total de la venta. Los precios individuales de los productos se ignorarán.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add Product Section */}
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Agregar Producto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              <span className="text-xs text-muted-foreground">{formatPrice(product.price)} - Stock: {product.stock}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Cantidad</label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          min="1"
                          max={selectedProduct ? products.find(p => p.id === selectedProduct)?.stock : undefined}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          type="button" 
                          onClick={addToCart} 
                          disabled={!selectedProduct}
                          className="w-full sm:w-auto min-w-[120px]"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Section */}
                {cart.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ShoppingCart className="h-4 w-4" />
                          Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})
                        </CardTitle>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold text-primary">{formatPrice(cartTotal)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Desktop Table */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-right">Precio Unit.</TableHead>
                              <TableHead className="text-right">Cant.</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                              <TableHead className="w-10"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cart.map((item) => (
                              <TableRow key={item.product.id}>
                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Input
                                      type="number"
                                      value={item.customPrice || item.product.price}
                                      onChange={(e) => updateCartItemPrice(item.product.id, parseFloat(e.target.value) || 0)}
                                      className="w-24 h-8 text-right"
                                      min="0"
                                      step="100"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateCartItemQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                    className="w-16 h-8 text-right"
                                    min="1"
                                  />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatPrice((item.customPrice || item.product.price) * item.quantity)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => removeFromCart(item.product.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden space-y-3">
                        {cart.map((item) => (
                          <div key={item.product.id} className="p-3 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{item.product.name}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive flex-shrink-0"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground">Precio</label>
                                <Input
                                  type="number"
                                  value={item.customPrice || item.product.price}
                                  onChange={(e) => updateCartItemPrice(item.product.id, parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                  min="0"
                                  step="100"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Cantidad</label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateCartItemQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                  className="h-8"
                                  min="1"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-border/50">
                              <span className="text-sm text-muted-foreground">Subtotal</span>
                              <span className="font-bold">{formatPrice((item.customPrice || item.product.price) * item.quantity)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes Section */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nombre del cliente, forma de pago, dirección de envío, etc."
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || cart.length === 0} className="w-full sm:w-auto">
                  {loading && <Spinner className="mr-2" />}
                  Registrar Venta ({formatPrice(cartTotal)})
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales list */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(sale.created_at)}
                    </TableCell>
                    <TableCell>
                      {sale.sale_items?.map((item) => (
                        <div key={item.id} className="text-sm">
                          {item.quantity}x {item.products?.name}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {sale.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(sale.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No hay ventas registradas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
