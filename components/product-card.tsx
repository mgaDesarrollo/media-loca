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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer" onClick={onClick}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">🧦</span>
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
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          {product.categories && (
            <span className="text-xs font-medium text-muted-foreground">
              {product.categories.name}
            </span>
          )}
          <h3 className="font-semibold leading-tight">{product.name}</h3>
        </div>
        {product.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation()
              handleShare()
            }}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
