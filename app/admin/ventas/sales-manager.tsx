'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  userId: string
}

interface CartItem {
  product: Product
  quantity: number
}

export function SalesManager({ initialSales, products, userId }: SalesManagerProps) {
  const [sales, setSales] = useState(initialSales)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }

    setLoading(true)

    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: userId,
        total: cartTotal,
        notes: notes || null,
      })
      .select()
      .single()

    if (saleError || !sale) {
      toast.error('Error al crear la venta')
      setLoading(false)
      return
    }

    // Create sale items
    const saleItems = cart.map((item) => ({
      sale_id: sale.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      subtotal: item.product.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      toast.error('Error al registrar los items')
      setLoading(false)
      return
    }

    // Register in cash register
    await supabase.from('cash_register').insert({
      user_id: userId,
      type: 'sale',
      amount: cartTotal,
      description: `Venta #${sale.id.slice(0, 8)}`,
      sale_id: sale.id,
    })

    // Update stock
    for (const item of cart) {
      await supabase
        .from('products')
        .update({ stock: item.product.stock - item.quantity })
        .eq('id', item.product.id)
    }

    toast.success('Venta registrada!')
    setLoading(false)
    setIsDialogOpen(false)
    setCart([])
    setNotes('')
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
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Venta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Add product */}
                <div className="flex gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatPrice(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-20"
                    min="1"
                  />
                  <Button type="button" onClick={addToCart} disabled={!selectedProduct}>
                    Agregar
                  </Button>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShoppingCart className="h-4 w-4" />
                        Carrito
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cant.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cart.map((item) => (
                            <TableRow key={item.product.id}>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">
                                {formatPrice(item.product.price * item.quantity)}
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
                          <TableRow>
                            <TableCell colSpan={2} className="font-bold">
                              Total
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              {formatPrice(cartTotal)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nombre del cliente, forma de pago, etc."
                      rows={2}
                    />
                  </Field>
                </FieldGroup>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || cart.length === 0}>
                  {loading && <Spinner className="mr-2" />}
                  Registrar Venta
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
