import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getOrderById } from '@/lib/actions/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-3xl">
          <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Volver a pedidos
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Editar Pedido #{order.id.slice(0, 8)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={`/api/orders/${order.id}`} method="POST">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer_name">Nombre del cliente</Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      defaultValue={order.customer_name || ''}
                      placeholder="Nombre del cliente"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer_phone">Teléfono</Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      defaultValue={order.customer_phone || ''}
                      placeholder="Teléfono del cliente"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      name="customer_email"
                      defaultValue={order.customer_email || ''}
                      placeholder="Email del cliente"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      defaultValue={order.notes || ''}
                      placeholder="Notas adicionales"
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Productos del pedido</h3>
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.products?.name || 'Producto'}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} x {formatPrice(item.unit_price)}
                            </p>
                          </div>
                          <p className="font-bold">{formatPrice(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Guardar cambios
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/admin/pedidos">Cancelar</Link>
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
