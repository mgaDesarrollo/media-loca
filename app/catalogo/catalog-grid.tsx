'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/product-card'
import { ProductDetailModal } from '@/components/product-detail-modal'
import { ShoppingCart } from '@/components/shopping-cart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, X, TrendingUp } from 'lucide-react'
import type { Product, Category, PromotionTier } from '@/lib/types'

interface CatalogGridProps {
  products: Product[]
  categories: Category[]
}

interface CartItem {
  product: Product
  quantity: number
}

export function CatalogGrid({ products, categories }: CatalogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promotionTiers, setPromotionTiers] = useState<PromotionTier[]>([])
  const [featuredTab, setFeaturedTab] = useState<'bestsellers' | 'new' | 'offers'>('bestsellers')

  // Categorize products deterministically
  const bestSellers = products.filter((_, idx) => idx % 3 === 0).slice(0, 4)
  const newDesigns = products.filter((_, idx) => idx % 3 === 1).slice(0, 4)
  const specialOffers = products.filter((product) => product.is_offer).slice(0, 4)

  const featuredProducts = 
    featuredTab === 'bestsellers' ? bestSellers :
    featuredTab === 'new' ? newDesigns :
    specialOffers

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch('/api/promotions')
        const data = await response.json()
        setPromotionTiers(data)
      } catch (error) {
        console.error('Error fetching promotions:', error)
      }
    }
    fetchPromotions()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory

    return matchesCategory
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
          <p className="mb-6 text-xs font-light text-primary-foreground/80 sm:text-sm">
            Diseños únicos que reflejan tu personalidad. Calidad premium en cada paso.
          </p>

          {/* Promociones por cantidad - Responsivo */}
          {promotionTiers && promotionTiers.length > 0 && (
            <div className="mt-6 flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-secondary-foreground mb-3.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/15">
                🔥 Combos de Descuento
              </span>
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-lg">
                {promotionTiers
                  .filter((tier) => tier.min_pairs >= 3 && tier.is_active)
                  .map((tier) => {
                    const basePrice = products.length > 0 ? Math.max(...products.map(p => Number(p.price))) : 4500
                    const discount = Math.round(((basePrice - Number(tier.price_per_pair)) / basePrice) * 100)
                    
                    return (
                      <div
                        key={tier.id}
                        className="relative overflow-hidden bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 border border-white/10 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-white/15 shadow-lg group"
                      >
                        <div className="absolute top-0 right-0 bg-secondary-foreground text-primary text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                          {discount}% OFF
                        </div>
                        <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider mt-1">
                          {tier.max_pairs < 100
                            ? `${tier.min_pairs}-${tier.max_pairs} pares`
                            : `${tier.min_pairs}+ pares`
                          }
                        </p>
                        <p className="text-sm sm:text-base font-black text-secondary-foreground mt-1">
                          {formatPrice(Number(tier.price_per_pair))}
                          <span className="text-[8px] sm:text-[9px] font-normal text-white/80"> / par</span>
                        </p>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
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

      {/* Sección de Destacados */}
      <section className="bg-muted/20 rounded-3xl p-6 sm:p-8 border border-border/40 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-2">
              🔥 Recomendados
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Nuestros Destacados
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Las medias más queridas, recién salidas del horno o con los mejores precios.
            </p>
          </div>

          {/* Tabs selector */}
          <div className="flex bg-muted p-1 rounded-xl border border-border max-w-fit self-start md:self-auto">
            <button
              onClick={() => setFeaturedTab('bestsellers')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                featuredTab === 'bestsellers'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Los más vendidos
            </button>
            <button
              onClick={() => setFeaturedTab('new')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                featuredTab === 'new'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Nuevos diseños
            </button>
            <button
              onClick={() => setFeaturedTab('offers')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                featuredTab === 'offers'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ofertas especiales
            </button>
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => {
            const originalIndex = products.findIndex(p => p.id === product.id)
            return (
              <div
                key={`featured-${product.id}`}
                className="animate-in fade-in duration-300"
              >
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product)}
                  isBestSeller={featuredTab === 'bestsellers'}
                  isNew={featuredTab === 'new'}
                  isOnSale={featuredTab === 'offers'}
                  index={originalIndex}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Filter Section */}
      <div className="sticky top-4 z-40 mb-8 flex items-center justify-center rounded-2xl bg-background/80 p-2 backdrop-blur-md shadow-lg border border-muted w-full max-w-fit mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-1 px-1">
          <Button
            variant={selectedCategory === null ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-xl px-4 sm:px-6 transition-all ${selectedCategory === null ? 'shadow-md scale-105' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-xl px-3 sm:px-6 transition-all ${selectedCategory === category.id ? 'shadow-md scale-105' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="truncate max-w-[80px] sm:max-w-none">{category.name}</span>
              {selectedCategory === category.id && (
                <X className="ml-1 sm:ml-2 h-3 w-3" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard 
                product={product} 
                onClick={() => handleProductClick(product)}
                index={index}
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
            onClick={() => setSelectedCategory(null)}
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
