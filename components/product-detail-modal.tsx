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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <FaShare className="h-4 w-4" />
                <span className="hidden sm:inline">Compartir</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6"
              >
                <FaTimes className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Imagen - Columna izquierda */}
          <div className="space-y-4">
            <div 
              className={`relative overflow-hidden rounded-lg bg-muted cursor-pointer transition-all ${
                isImageExpanded ? 'aspect-square' : 'aspect-[3/4]'
              }`}
              onClick={() => setIsImageExpanded(!isImageExpanded)}
            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">🧦</span>
                </div>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground">
                  Ultimas unidades
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary" className="absolute right-2 top-2">
                  Agotado
                </Badge>
              )}
              {/* Botón de expandir */}
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 bg-black/50 hover:bg-black/70 text-white"
                >
                  {isImageExpanded ? <FaCompress className="h-3 w-3" /> : <FaExpand className="h-3 w-3" />}
                  {isImageExpanded ? 'Reducir' : 'Expandir'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click en la imagen para {isImageExpanded ? 'reducir' : 'expandir'}
            </p>
          </div>

          {/* Detalles - Columna derecha */}
          <div className="space-y-6">
            {/* Categoría y Precio */}
            <div>
              {product.categories && (
                <Badge variant="outline" className="mb-2">
                  {product.categories.name}
                </Badge>
              )}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
            </div>

            {/* Descripción */}
            {product.description && (
              <div>
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Selector de cantidad */}
            <div>
              <h4 className="font-semibold mb-2">Cantidad</h4>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FaMinus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <FaPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full gap-2"
                size="lg"
              >
                <FaShoppingCart className="h-4 w-4" />
                {product.stock === 0 ? 'Sin stock' : `Agregar al carrito (${formatPrice(product.price * quantity)})`}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full gap-2"
              >
                <FaShare className="h-4 w-4" />
                Compartir por WhatsApp
              </Button>
            </div>

            {/* Información adicional */}
            <div className="text-sm text-muted-foreground space-y-1 border-t pt-4">
              <p>• Envíos a todo el país</p>
              <p>• Consulta por combos y mayorista</p>
              <p>• Medias de alta calidad y durabilidad</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
