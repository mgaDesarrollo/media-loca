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
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Sale {
  id: string
  user_id: string
  total: number
  notes: string | null
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
