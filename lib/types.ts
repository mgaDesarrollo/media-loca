export interface Category {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  stock: number
  is_active: boolean
  is_offer?: boolean
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Sale {
  id: string
  user_id: string
  total: number
  notes: string | null
  payment_method: 'cash' | 'virtual'
  is_test: boolean
  created_at: string
  sale_items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  products?: Product
}

export interface CashRegisterEntry {
  id: string
  user_id: string
  type: 'income' | 'expense' | 'sale' | 'adjustment'
  amount: number
  description: string | null
  sale_id: string | null
  created_at: string
}

export interface ProfileConfig {
  id: string
  store_name: string
  email: string
  phone: string | null
  whatsapp: string | null
  address: string | null
  description: string | null
  social_facebook: string | null
  social_instagram: string | null
  app_icon: string | null
  created_at: string
  updated_at: string
}

export interface PromotionTier {
  id: string
  min_pairs: number
  max_pairs: number
  price_per_pair: number
  label: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  total: number
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  payment_method?: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  products?: Product
}
