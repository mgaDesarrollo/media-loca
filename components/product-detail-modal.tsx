'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FaShare, FaPlus, FaMinus, FaShoppingCart, FaExpand, FaCompress, FaTimes } from 'react-icons/fa'
import type { Product } from '@/lib/types'

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
  const [isImageExpanded, setIsImageExpanded] = useState(false)

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
      setQuantity(1)
      onClose()
    }
  }

  const handleShare = () => {
    if (!product) return
    const message = encodeURIComponent(
      `Mira estas medias de Media Loca!\n\n${product.name}\n${product.description || ''}\nPrecio: ${formatPrice(product.price)}\n\nVe el catalogo completo en: ${window.location.origin}/catalogo`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && product && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto border-none bg-background/95 backdrop-blur-xl shadow-2xl p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2">
          {/* Close button - Fixed for desktop, relative for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-background/50 backdrop-blur-md hover:bg-background/80"
          >
            <FaTimes className="h-5 w-5" />
          </Button>
          {/* Imagen - Columna izquierda */}
          <div className="relative group bg-muted/30">
            <div 
              className={`relative overflow-hidden transition-all duration-500 ${
                isImageExpanded ? 'aspect-square' : 'aspect-[4/5] lg:aspect-auto lg:h-full'
              }`}
              onClick={() => setIsImageExpanded(!isImageExpanded)}
            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                  <span className="text-8xl grayscale opacity-20">🧦</span>
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute left-6 top-6 flex flex-col gap-2">
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge className="bg-amber-500 text-white border-none px-3 py-1 text-sm font-bold shadow-lg shadow-amber-500/20">
                    ¡Últimas {product.stock} unidades!
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="secondary" className="bg-destructive text-destructive-foreground border-none px-3 py-1 text-sm font-bold shadow-lg">
                    Agotado
                  </Badge>
                )}
              </div>

              {/* Botón de expandir */}
              <div className="absolute bottom-6 right-6">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-10 px-4 rounded-full gap-2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border-none transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsImageExpanded(!isImageExpanded)
                  }}
                >
                  {isImageExpanded ? <FaCompress className="h-4 w-4" /> : <FaExpand className="h-4 w-4" />}
                  <span className="font-medium">{isImageExpanded ? 'Ver normal' : 'Expandir imagen'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Detalles - Columna derecha */}
          <div className="flex flex-col p-8 lg:p-12">
            <div className="flex-1 space-y-8">
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {product.categories && (
                    <Badge variant="secondary" className="px-3 py-1 font-semibold uppercase tracking-wider text-[10px] bg-primary/10 text-primary border-none">
                      {product.categories.name}
                    </Badge>
                  )}
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    Stock dponible: {product.stock}
                  </span>
                </div>
                
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Descripción</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Acciones de compra */}
              <div className="space-y-6 border-t border-b border-muted py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cantidad</h4>
                    <div className="flex items-center bg-muted/50 rounded-full p-1 w-fit">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-background"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <FaMinus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center text-lg font-bold">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-background"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                      >
                        <FaPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-black text-foreground">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="h-14 rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    size="lg"
                  >
                    <FaShoppingCart className="h-5 w-5" />
                    {product.stock === 0 ? 'Sin stock' : 'Sumar al carrito'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="h-14 rounded-2xl gap-3 border-2 font-bold hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600 transition-all"
                  >
                    <FaShare className="h-5 w-5" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Beneficios / Info extra */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center">
                    <span className="text-xl">🇦🇷</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Envíos a todo el país</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                   <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Alta calidad</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                   <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center">
                    <span className="text-xl">🤝</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Atención personalizada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
