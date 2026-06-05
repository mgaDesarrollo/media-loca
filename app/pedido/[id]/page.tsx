import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getOrderById } from '@/lib/actions/admin'
import { getProfileConfig } from '@/lib/db/queries'
import { Package, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id)
  const profile = await getProfileConfig()

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pendiente</Badge>
      case 'confirmed':
        return <Badge variant="default" className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" /> Confirmado</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const whatsappNumber = profile?.whatsapp || ''
  const whatsappMessage = encodeURIComponent(
    `Hola, quiero confirmar el pedido #${order.id.slice(0, 8)} por un total de ${formatPrice(order.total)}`
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={false} />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Pedido #{order.id.slice(0, 8)}
                </span>
                {getStatusBadge(order.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información del pedido */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{getStatusBadge(order.status)}</p>
                </div>
                {order.customer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                )}
                {order.customer_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{order.customer_phone}</p>
                  </div>
                )}
              </div>

              {/* Items del pedido */}
              <div>
                <h3 className="font-semibold mb-3">Productos</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
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

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Notas */}
              {order.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}

              {/* Acciones */}
              {order.status === 'pending' && whatsappNumber && (
                <Button asChild className="w-full gap-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contactar por WhatsApp
                  </a>
                </Button>
              )}

              {order.status === 'confirmed' && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    ✅ Pedido confirmado. Gracias por tu compra.
                  </p>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    ❌ Este pedido fue cancelado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
