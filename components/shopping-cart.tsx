'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ShoppingCart as ShoppingCartIcon, X, Plus, Minus, MessageCircle, Trash2, TrendingUp, AlertCircle } from 'lucide-react'
import type { Product } from '@/lib/types'
import { calculatePromotion, getNextDiscountMessage, formatPrice as formatPromotionPrice } from '@/lib/promotions'

interface CartItem {
  product: Product
  quantity: number
}

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
}

export function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [deliveryPreference, setDeliveryPreference] = useState<'envio' | 'retiro' | ''>('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getAveragePrice = () => {
    if (items.length === 0) return 0
    const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
    return totalPrice / getTotalItems()
  }

  const getTotalPrice = () => {
    const totalPairs = getTotalItems()
    const avgPrice = getAveragePrice()
    const promotion = calculatePromotion(totalPairs, avgPrice)
    return promotion.discountedTotal
  }

  const getOriginalTotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const promotion = calculatePromotion(getTotalItems(), getAveragePrice())
  const discountMessage = getNextDiscountMessage(promotion.pairsNeededForNextTier, promotion.savings)

  const validateStock = () => {
    const lowStockItems = items.filter(item => item.quantity > item.product.stock)
    return lowStockItems.length === 0
  }

  const handleCheckout = async () => {
    if (!validateStock()) {
      alert('Algunos productos tienen stock insuficiente. Por favor reduce las cantidades.')
      return
    }

    try {
      const { getProfileConfigPublic } = await import('@/lib/actions/admin')
      const profile = await getProfileConfigPublic()
      const whatsappNumber = profile?.whatsapp || ''

      const cartItems = items.map(item =>
        `${item.quantity}x ${item.product.name} - ${formatPrice(item.product.price * item.quantity)}`
      ).join('\n')

      const promotionText = promotion.savings > 0
        ? `\n🎉 ¡Promoción aplicada! Ahorrás ${formatPrice(promotion.savings)}\n`
        : ''

      const customerInfo = customerName || deliveryPreference
        ? `\n\n📝 Datos del cliente:\n${customerName ? `Nombre: ${customerName}\n` : ''}${deliveryPreference ? `Prefiere: ${deliveryPreference === 'envio' ? 'Envío' : 'Retiro'}\n` : ''}`
        : ''

      const message = encodeURIComponent(
        `¡Hola! Quiero realizar un pedido de Media Loca:\n\n` +
        `${cartItems}\n\n` +
        `Total: ${formatPrice(getTotalPrice())}${promotionText}` +
        `${customerInfo}\n\n` +
        `¿Podrían confirmarme disponibilidad y formas de pago?`
      )

      const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${message}`
        : `https://wa.me/?text=${message}`

      window.open(whatsappUrl, '_blank')
      onClearCart()
      setIsOpen(false)
    } catch {
      alert('Error al procesar el pedido. Por favor intenta nuevamente.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg gap-2 z-50 border-2 border-black bg-white text-black hover:bg-gray-100">
          <ShoppingCartIcon className="h-6 w-6" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs border-2 border-black bg-primary text-white">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCartIcon className="h-5 w-5" />
              Tu Carrito
            </span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Vaciar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCartIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground mt-2">
              Agrega productos para comenzar tu pedido
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Promotion Progress Bar */}
            {getTotalItems() > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Promociones por cantidad</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getTotalItems()} {getTotalItems() === 1 ? 'par' : 'pares'}
                      </Badge>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{promotion.currentTier.label}</span>
                        {promotion.nextTier && (
                          <span>{promotion.nextTier.label}</span>
                        )}
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ 
                            width: promotion.nextTier 
                              ? `${(getTotalItems() / promotion.nextTier.minPairs) * 100}%`
                              : '100%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Dynamic discount message */}
                    {discountMessage && (
                      <div className="flex items-start gap-2 text-sm text-primary">
                        <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{discountMessage}</p>
                      </div>
                    )}

                    {/* Current promotion info */}
                    {promotion.savings > 0 && (
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          ¡Precio promocional aplicado!
                        </span>
                        <span className="text-sm font-bold text-green-700 dark:text-green-300">
                          {formatPromotionPrice(promotion.pricePerPair)}/par
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stock validation warning */}
            {!validateStock() && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Stock insuficiente</p>
                      <p className="text-xs mt-1">
                        Algunos productos exceden el stock disponible. Por favor reduce las cantidades.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items del carrito */}
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Imagen */}
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-xl">🧦</span>
                          </div>
                        )}
                      </div>

                      {/* Detalles */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price)} c/u
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onRemoveItem(item.product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumen y checkout */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Formulario opcional de datos del cliente */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Datos del cliente (opcional)</p>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryPreference('envio')}
                        className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                          deliveryPreference === 'envio' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                      >
                        Envío
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryPreference('retiro')}
                        className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                          deliveryPreference === 'retiro' ? 'bg-primary text-primary-foreground' : 'bg-background'
                        }`}
                      >
                        Retiro
                      </button>
                    </div>
                  </div>

                  {promotion.savings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground line-through">
                        Precio original:
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(getOriginalTotal())}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <div className="text-right">
                      {promotion.savings > 0 && (
                        <span className="text-sm text-green-600 dark:text-green-400 block">
                          Ahorrás {formatPrice(promotion.savings)}
                        </span>
                      )}
                      <span className={promotion.savings > 0 ? "text-green-600 dark:text-green-400" : "text-primary"}>
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full gap-2"
                    size="lg"
                    disabled={!validateStock()}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Finalizar pedido por WhatsApp
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Te enviaremos un mensaje con tu pedido para confirmar
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
