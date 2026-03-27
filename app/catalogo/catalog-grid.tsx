'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product-card'
import { ProductDetailModal } from '@/components/product-detail-modal'
import { ShoppingCart } from '@/components/shopping-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MessageCircle, X } from 'lucide-react'
import type { Product, Category } from '@/lib/types'

interface CatalogGridProps {
  products: Product[]
  categories: Category[]
}

interface CartItem {
  product: Product
  quantity: number
}

export function CatalogGrid({ products, categories }: CatalogGridProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = 
      !selectedCategory || product.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Ordenar: primero productos con imagen, luego sin imagen
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Si A tiene imagen y B no, A va primero
    if (a.image_url && !b.image_url) return -1
    // Si B tiene imagen y A no, B va primero
    if (!a.image_url && b.image_url) return 1
    // Si ambos tienen imagen o ambos no tienen, mantener orden original
    return 0
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const shareFullCatalog = () => {
    const catalogText = sortedProducts
      .map((p) => `- ${p.name}: ${formatPrice(p.price)}`)
      .join('\n')
    
    const message = encodeURIComponent(
      `Catalogo de Media Loca\n\n${catalogText}\n\nVe mas en: ${window.location.href}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prev, { product, quantity }]
      }
    })
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.product.id !== productId))
    } else {
      setCartItems(prev => prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId))
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="relative -mx-4 -mt-8 mb-6 overflow-hidden bg-primary px-4 py-8 text-primary-foreground sm:mx-0 sm:rounded-3xl lg:py-10">
        {/* Background Decorative Elements */}
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-20 transition-transform duration-1000 hover:scale-110">
          <div className="h-24 w-24 rounded-full bg-white blur-3xl" />
        </div>
        <div className="absolute left-0 bottom-0 translate-y-1/4 -translate-x-1/4 opacity-10">
          <div className="h-32 w-32 rounded-full bg-black blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <Badge className="mb-1 bg-white/20 text-white border-none backdrop-blur-md px-2.5 py-0 text-[10px]">
            Colección 2026
          </Badge>
          <h1 className="mb-1 text-2xl font-black tracking-tighter sm:text-4xl">
            MEDIA <span className="text-secondary-foreground">LOCA</span>
          </h1>
          <p className="mb-4 text-xs font-light text-primary-foreground/80 sm:text-sm">
            Diseños únicos que reflejan tu personalidad. Calidad premium en cada paso.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary" />
              <Input
                placeholder="Busca tu estilo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border-none bg-white pl-9 text-black shadow-xl focus-visible:ring-offset-0 text-sm"
              />
            </div>
            <Button 
              onClick={shareFullCatalog} 
              className="h-10 rounded-xl bg-black text-white px-5 font-bold shadow-xl transition-all hover:bg-black/90 hover:scale-105 active:scale-95 gap-2 text-xs"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Compartir Catálogo
            </Button>
          </div>
        </div>
      </div>

      {/* Carrito de compras */}
      <ShoppingCart
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Modal de detalles */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Filter Section */}
      <div className="sticky top-4 z-40 mb-8 flex items-center justify-center rounded-2xl bg-background/80 p-2 backdrop-blur-md shadow-lg border border-muted w-fit mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Button
            variant={selectedCategory === null ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-xl px-6 transition-all ${selectedCategory === null ? 'shadow-md scale-105' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-xl px-6 transition-all ${selectedCategory === category.id ? 'shadow-md scale-105' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
              {selectedCategory === category.id && (
                <X className="ml-2 h-3 w-3" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard 
                product={product} 
                onClick={() => handleProductClick(product)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            No encontramos medias con esos filtros
          </p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearch('')
              setSelectedCategory(null)
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Results count */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Mostrando {sortedProducts.length} de {products.length} productos
      </p>
    </div>
  )
}
