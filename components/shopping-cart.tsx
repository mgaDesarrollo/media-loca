'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ShoppingCart as ShoppingCartIcon, X, Plus, Minus, MessageCircle, Trash2 } from 'lucide-react'
import type { Product } from '@/lib/types'

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

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    const cartItems = items.map(item => 
      `${item.quantity}x ${item.product.name} - ${formatPrice(item.product.price * item.quantity)}`
    ).join('\n')
    
    const message = encodeURIComponent(
      `¡Hola! Quiero realizar un pedido de Media Loca:\n\n` +
      `${cartItems}\n\n` +
      `Total: ${formatPrice(getTotalPrice())}\n\n` +
      `¿Podrían confirmarme disponibilidad y formas de pago?`
    )
    
    window.open(`https://wa.me/?text=${message}`, '_blank')
    onClearCart()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gap-2 md:relative md:bottom-auto md:right-auto md:h-auto md:w-auto md:rounded-md">
          <ShoppingCartIcon className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
              {getTotalItems()}
            </Badge>
          )}
          <span className="hidden md:inline">Carrito</span>
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
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar pedido por WhatsApp
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
