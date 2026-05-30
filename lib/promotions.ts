import type { PromotionTier as DBPromotionTier } from '@/lib/types'

export interface PromotionTier {
  id?: string
  minPairs: number
  maxPairs: number
  pricePerPair: number
  label: string
  isActive?: boolean
}

export interface PromotionInfo {
  currentTier: PromotionTier
  nextTier: PromotionTier | null
  pairsNeededForNextTier: number
  originalTotal: number
  discountedTotal: number
  savings: number
  pricePerPair: number
}

// Valores por defecto (se usarán hasta que se configuren desde la DB)
const DEFAULT_PROMOTION_TIERS: PromotionTier[] = [
  { minPairs: 1, maxPairs: 2, pricePerPair: 0, label: 'Precio normal', isActive: true },
  { minPairs: 3, maxPairs: 5, pricePerPair: 3800, label: 'Pack 3-5 pares', isActive: true },
  { minPairs: 6, maxPairs: 11, pricePerPair: 3500, label: 'Pack 6-11 pares', isActive: true },
  { minPairs: 12, maxPairs: 999999, pricePerPair: 3200, label: 'Pack 12+ pares', isActive: true },
]

let cachedPromotionTiers: PromotionTier[] | null = null

export function setPromotionTiers(tiers: PromotionTier[]) {
  cachedPromotionTiers = tiers
}

export function getPromotionTiersSync(): PromotionTier[] {
  return cachedPromotionTiers || DEFAULT_PROMOTION_TIERS
}

export function calculatePromotion(totalPairs: number, originalPricePerPair: number): PromotionInfo {
  const tiers = getPromotionTiersSync()
  const activeTiers = tiers.filter(t => t.isActive !== false)
  
  const currentTier = activeTiers.find(
    tier => totalPairs >= tier.minPairs && totalPairs <= tier.maxPairs
  ) || activeTiers[0]

  const nextTier = activeTiers.find(tier => tier.minPairs > totalPairs) || null
  const pairsNeededForNextTier = nextTier ? nextTier.minPairs - totalPairs : 0

  const pricePerPair = currentTier.pricePerPair > 0 ? currentTier.pricePerPair : originalPricePerPair
  const originalTotal = totalPairs * originalPricePerPair
  const discountedTotal = totalPairs * pricePerPair
  const savings = originalTotal - discountedTotal

  return {
    currentTier,
    nextTier,
    pairsNeededForNextTier,
    originalTotal,
    discountedTotal,
    savings,
    pricePerPair,
  }
}

export function getNextDiscountMessage(pairsNeeded: number, savings: number): string | null {
  if (pairsNeeded === 0) return null
  return `¡Agregá ${pairsNeeded} par${pairsNeeded > 1 ? 'es' : ''} más y ahorrá $${savings.toLocaleString('es-AR')} en tu compra!`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price)
}
