'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FaShare, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart, 
  FaTimes, 
  FaChevronRight,
  FaArrowLeft
} from 'react-icons/fa'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number) => void
}

export function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)

  // Reset quantity when modal opens/changes product
  useEffect(() => {
    if (isOpen) setQuantity(1)
  }, [isOpen, product])

  if (!product) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      onAddToCart(product, quantity)
      onClose()
    }
  }

  const handleShare = () => {
    if (!product) return
    const message = encodeURIComponent(
      `¡Mira estas medias de Media Loca!\n\n${product.name}\n${product.description || ''}\nPrecio: ${formatPrice(product.price)}\n\nVe el catálogo completo en: ${window.location.origin}/catalogo`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-background sm:rounded-[32px] overflow-hidden max-w-[95vw] sm:max-w-[800px] gap-0 shadow-2xl">
        {/* Visually Hidden Title for Accessibility */}
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        
        {/* Close Button - Responsive Position */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md border-none transition-all shadow-sm"
        >
          <FaTimes className="h-5 w-5" />
        </Button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
          {/* LEFT COLUMN: IMAGE SECTION */}
          <div className="relative w-full lg:w-[45%] bg-muted/30 aspect-square lg:aspect-auto lg:h-[600px] shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover lg:object-center"
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary/10">
                <span className="text-9xl grayscale opacity-10">🧦</span>
              </div>
            )}
            
            {/* Mobile Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent lg:hidden" />
            
            {/* Status Badges */}
            <div className="absolute left-6 top-6 flex flex-col gap-2">
              {product.stock <= 5 && product.stock > 0 && (
                <Badge className="bg-amber-500 text-white border-none py-1.5 px-3 rounded-full font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-lg shadow-amber-500/20">
                  ¡Solo {product.stock} unidades!
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary" className="bg-destructive text-destructive-foreground border-none py-1.5 px-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg">
                  Agotado
                </Badge>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CONTENT SECTION */}
          <div className="flex flex-col flex-1 p-6 lg:p-10 lg:overflow-y-auto">
            {/* Breadcrumb info */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-1 rounded">
                {product.categories?.name || 'Colección'}
              </span>
              <FaChevronRight className="h-2 w-2 text-muted-foreground/50" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Media Loca
              </span>
            </div>

            {/* Product Title & Price */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight text-foreground">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.stock > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase italic">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    En inventario
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8 p-4 rounded-2xl bg-muted/20 border border-muted/30">
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  {product.description}
                </p>
              </div>
            )}

            {/* Selector & Purchase Actions */}
            <div className="mt-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between border-t pt-8">
                {/* Quantity Control */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cantidad</p>
                  <div className="flex items-center justify-between bg-muted/40 rounded-2xl p-1.5 w-[140px] border border-muted/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-background shadow-none"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <FaMinus className="h-3 w-3" />
                    </Button>
                    <span className="text-lg font-black w-8 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-background shadow-none"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.stock || 99)}
                    >
                      <FaPlus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total del pedido</p>
                  <p className="text-2xl font-black text-foreground">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              </div>

              {/* Major Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="h-16 rounded-[20px] gap-3 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground border-none"
                >
                  <FaShoppingCart className="h-5 w-5" />
                  {product.stock === 0 ? 'NOTIFICAR CUANDO VUELVA' : 'SUMAR AL CARRITO'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="h-14 rounded-[20px] gap-3 border-2 font-bold hover:bg-background hover:text-green-600 hover:border-green-500/50 transition-all text-muted-foreground"
                >
                  <FaShare className="h-4 w-4" />
                  COMPARTIR POR WHATSAPP
                </Button>
              </div>

              {/* Quality Badges */}
              <div className="flex items-center justify-between pt-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default overflow-x-auto gap-4 no-scrollbar">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[8px] font-black tracking-widest uppercase">Alta Calidad</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[8px] font-black tracking-widest uppercase">Envíos a todo el País</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[8px] font-black tracking-widest uppercase">Compra Segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
