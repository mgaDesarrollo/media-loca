'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { CheckCircle, XCircle, ArrowLeft, Package, MessageCircle, Edit } from 'lucide-react'
import { getOrders, confirmOrder, cancelOrder } from '@/lib/actions/admin'
import type { Order } from '@/lib/types'

export default function PedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await getOrders()
      setOrders(data)
    } catch {
      toast.error('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      const order = orders.find(o => o.id === orderId)
      const defaultPayment = order?.payment_method || 'cash'
      const input = prompt('Forma de pago (escribe "cash" para Efectivo o "virtual" para Transferencia):', defaultPayment === 'virtual' ? 'virtual' : 'cash')
      if (input === null) {
        setActionLoading(null)
        return
      }
      const normalized = input.trim().toLowerCase()
      const paymentMethod = (normalized === 'virtual' || normalized === 'transfer' || normalized === 'transferencia') ? 'virtual' : 'cash'
      await confirmOrder(orderId, paymentMethod)
      toast.success('Pedido confirmado y venta registrada')

      // Preguntar si quiere enviar mensaje automático al cliente
      if (order?.customer_phone) {
        const sendMessage = confirm('¿Quieres enviar un mensaje automático al cliente?')
        if (sendMessage) {
          const message = encodeURIComponent(
            `¡Hola ${order.customer_name || ''}! Tu pedido #${orderId.slice(0, 8)} ha sido confirmado exitosamente. Gracias por tu compra.`
          )
          window.open(`https://wa.me/${order.customer_phone}?text=${message}`, '_blank')
        }
      }

      await loadOrders()
    } catch (error: any) {
      toast.error(error.message || 'Error al confirmar el pedido')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return
    
    setActionLoading(orderId)
    try {
      await cancelOrder(orderId)
      toast.success('Pedido cancelado')
      await loadOrders()
    } catch {
      toast.error('Error al cancelar el pedido')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>
      case 'confirmed':
        return <Badge variant="default" className="bg-green-600">Confirmado</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header isAuthenticated={true} />
        <main className="flex-1 flex items-center justify-center">
          <Spinner />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold">Pedidos de Clientes</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Lista de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay pedidos pendientes</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name || 'Anónimo'}</p>
                              {order.customer_phone && (
                                <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                              )}
                              {order.payment_method && (
                                <p className="text-xs mt-1 text-muted-foreground">
                                  Pago: <span className="font-semibold text-foreground">{order.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}</span>
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {order.order_items?.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  {item.quantity}x {item.products?.name || 'Producto'}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatPrice(order.total)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {order.customer_phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const cleanPhone = order.customer_phone!.replace(/\D/g, '')
                                    const message = encodeURIComponent(
                                      `Hola, te escribo sobre tu pedido #${order.id.slice(0, 8)} por un total de ${formatPrice(order.total)}.`
                                    )
                                    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
                                  }}
                                  className="gap-1"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp
                                </Button>
                              )}
                              {order.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleConfirmOrder(order.id)}
                                    disabled={actionLoading === order.id}
                                    className="gap-1"
                                  >
                                    {actionLoading === order.id ? (
                                      <Spinner className="h-4 w-4" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                    Confirmar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={actionLoading === order.id}
                                    className="gap-1 text-destructive"
                                  >
                                    {actionLoading === order.id ? (
                                      <Spinner className="h-4 w-4" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/admin/pedidos/${order.id}/edit`)}
                                    className="gap-1"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
