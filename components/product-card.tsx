'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2 } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  onShare?: (product: Product) => void
  onClick?: () => void
}

export function ProductCard({ product, onShare, onClick }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleShare = () => {
    if (onShare) {
      onShare(product)
    } else {
      const message = encodeURIComponent(
        `Mira estas medias de Media Loca!\n\n${product.name}\n${product.description || ''}\nPrecio: ${formatPrice(product.price)}\n\nVe el catalogo completo en: ${window.location.origin}/catalogo`
      )
      window.open(`https://wa.me/?text=${message}`, '_blank')
    }
  }

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
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.categories && (
            <Badge className="w-fit bg-primary/80 backdrop-blur-md text-primary-foreground border-none font-medium px-2.5 py-0.5">
              {product.categories.name}
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="w-fit bg-amber-500/90 backdrop-blur-md text-white border-none animate-pulse">
              ¡Últimas {product.stock}!
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="w-fit bg-destructive/90 backdrop-blur-md text-destructive-foreground border-none">
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

      <CardContent className="p-5 flex flex-col justify-between h-[140px]">
        <div className="space-y-1.5">
          <h3 className="font-bold text-lg leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Precio</span>
            <span className="text-xl font-bold text-primary tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-primary/5 hover:bg-primary/20 text-primary transition-all duration-300 transform group-hover:rotate-12"
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
