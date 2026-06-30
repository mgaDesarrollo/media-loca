'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  onClick?: () => void
  isBestSeller?: boolean
  isNew?: boolean
  isOnSale?: boolean
  index?: number
}

export function ProductCard({ 
  product, 
  onClick,
  isBestSeller: propBestSeller,
  isNew: propNew,
  isOnSale: propOnSale,
  index
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Determine state values: prioritize props, fallback to index-based distribution if index is provided
  const isBestSeller = propBestSeller !== undefined ? propBestSeller : (index !== undefined ? index % 3 === 0 : false)
  const isNew = propNew !== undefined ? propNew : (index !== undefined ? index % 3 === 1 : false)
  const isOnSale = propOnSale !== undefined ? propOnSale : (index !== undefined ? index % 3 === 2 : false)

  return (
    <Card 
      className="group relative overflow-hidden border-none bg-background/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer" 
      onClick={onClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
            <span className="text-6xl animate-pulse">🧦</span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

        {/* Badges container */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 max-w-[calc(100%-24px)] z-10">
          {product.categories && (
            <Badge className="max-w-[120px] bg-primary/80 backdrop-blur-md text-primary-foreground border-none font-medium px-2 py-0.5 truncate text-[10px]">
              {product.categories.name}
            </Badge>
          )}
          {isBestSeller && (
            <Badge className="max-w-[120px] bg-rose-500/90 backdrop-blur-md text-white border-none font-semibold px-2 py-0.5 shadow-sm text-[10px]">
              🔥 Top Ventas
            </Badge>
          )}
          {isNew && (
            <Badge className="max-w-[120px] bg-emerald-500/90 backdrop-blur-md text-white border-none font-semibold px-2 py-0.5 shadow-sm text-[10px]">
              ✨ Nuevo
            </Badge>
          )}
          {isOnSale && (
            <Badge className="max-w-[120px] bg-purple-600/95 backdrop-blur-md text-white border-none font-semibold px-2 py-0.5 shadow-sm text-[10px]">
              🏷️ Oferta
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="max-w-[120px] bg-amber-500/90 backdrop-blur-md text-white border-none animate-pulse truncate px-2 py-0.5 text-[10px]">
              ¡Últimas {product.stock}!
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="max-w-[120px] bg-destructive/90 backdrop-blur-md text-destructive-foreground border-none truncate px-2 py-0.5 text-[10px]">
              Agotado
            </Badge>
          )}
        </div>

        {/* Quick action button that appears on hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-12 transition-transform duration-500 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 px-4">
           <Button 
            className="w-full bg-white/90 hover:bg-white text-black border-none backdrop-blur-md shadow-lg"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
           >
             Ver detalles
           </Button>
        </div>
      </div>

      <CardContent className="p-3 sm:p-5 flex flex-col justify-between h-[120px] sm:h-[140px]">
        <div className="space-y-1">
          <h3 className="font-bold text-base sm:text-lg leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 sm:pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Precio</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-primary tracking-tight">
                {formatPrice(product.price)}
              </span>
              {isOnSale && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through opacity-70 font-normal">
                  {formatPrice(Math.round(product.price * 1.25))}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
