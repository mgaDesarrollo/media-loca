import { sql } from '@/lib/db'
import type {
  CashRegisterEntry,
  Category,
  Product,
  ProfileConfig,
  Sale,
  SaleItem,
  PromotionTier,
} from '@/lib/types'

type ProductRow = Product & { categories: Category | null }

function mapProduct(row: ProductRow): Product {
  const { categories, ...product } = row
  return categories ? { ...product, categories } : product
}

export async function getCategories(): Promise<Category[]> {
  return sql`
    SELECT * FROM categories ORDER BY name
  ` as Promise<Category[]>
}

export async function getActiveCategories(): Promise<Category[]> {
  return sql`
    SELECT * FROM categories
    WHERE is_active = true
    ORDER BY name
  ` as Promise<Category[]>
}

export async function getProductsWithCategories(activeOnly = false): Promise<Product[]> {
  const rows = activeOnly
    ? ((await sql`
        SELECT
          p.*,
          CASE WHEN c.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'is_active', c.is_active,
            'created_at', c.created_at,
            'updated_at', c.updated_at
          )
          END AS categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.created_at DESC
      `) as ProductRow[])
    : ((await sql`
        SELECT
          p.*,
          CASE WHEN c.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', c.id,
            'name', c.name,
            'description', c.description,
            'is_active', c.is_active,
            'created_at', c.created_at,
            'updated_at', c.updated_at
          )
          END AS categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `) as ProductRow[])

  return rows.map(mapProduct)
}

export async function getActiveProducts(): Promise<Product[]> {
  return sql`
    SELECT * FROM products
    WHERE is_active = true
    ORDER BY name
  ` as Promise<Product[]>
}

export async function getProductCount(): Promise<number> {
  const result = await sql`SELECT COUNT(*)::int AS count FROM products`
  return result[0]?.count ?? 0
}

export async function getSalesByUser(userId: string): Promise<Sale[]> {
  const sales = (await sql`
    SELECT * FROM sales
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as Sale[]

  if (sales.length === 0) return []

  const saleIds = sales.map((sale) => sale.id)
  const items = (await sql`
    SELECT
      si.*,
      json_build_object(
        'id', p.id,
        'name', p.name,
        'description', p.description,
        'price', p.price,
        'image_url', p.image_url,
        'category_id', p.category_id,
        'stock', p.stock,
        'is_active', p.is_active,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      ) AS products
    FROM sale_items si
    JOIN products p ON p.id = si.product_id
    WHERE si.sale_id = ANY(${saleIds})
  `) as (SaleItem & { products: Product })[]

  const itemsBySale = items.reduce<Record<string, (SaleItem & { products?: Product })[]>>(
    (acc, item) => {
      if (!acc[item.sale_id]) acc[item.sale_id] = []
      acc[item.sale_id].push(item)
      return acc
    },
    {},
  )

  return sales.map((sale) => ({
    ...sale,
    sale_items: itemsBySale[sale.id] ?? [],
  }))
}

export async function getSalesTotals(userId: string) {
  const result = await sql`
    SELECT total FROM sales WHERE user_id = ${userId}
  `
  return result as { total: number }[]
}

export async function getCashRegisterByUser(userId: string): Promise<CashRegisterEntry[]> {
  return sql`
    SELECT * FROM cash_register
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  ` as Promise<CashRegisterEntry[]>
}

export async function getProfileConfig(): Promise<ProfileConfig | null> {
  const rows = await sql`
    SELECT * FROM profile_config ORDER BY created_at ASC LIMIT 1
  `
  return (rows[0] as ProfileConfig | undefined) ?? null
}

export async function getPromotionTiers(): Promise<PromotionTier[]> {
  const rows = await sql`
    SELECT * FROM promotion_config ORDER BY min_pairs ASC
  `
  return rows as PromotionTier[]
}

// Análisis de ventas
export async function getTopSellingProducts(limit = 10) {
  const rows = await sql`
    SELECT 
      p.name,
      p.category_id,
      c.name as category_name,
      SUM(si.quantity) as total_quantity,
      SUM(si.subtotal) as total_revenue,
      COUNT(DISTINCT si.sale_id) as number_of_sales,
      AVG(p.price) as avg_price
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    GROUP BY p.id, p.name, p.category_id, c.name
    ORDER BY total_quantity DESC
    LIMIT ${limit}
  `
  return rows
}

export async function getSalesByPeriod() {
  const rows = await sql`
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as total_sales,
      SUM(total) as total_revenue,
      AVG(total) as avg_sale_value,
      COUNT(DISTINCT user_id) as unique_sellers
    FROM sales
    WHERE is_test = false
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month DESC
  `
  return rows
}

export async function getSalesByCategory() {
  const rows = await sql`
    SELECT 
      c.name as category_name,
      COUNT(DISTINCT si.sale_id) as total_sales,
      SUM(si.quantity) as total_items_sold,
      SUM(si.subtotal) as total_revenue,
      AVG(si.unit_price) as avg_price_per_item
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY total_revenue DESC
  `
  return rows
}

export async function getOrdersStats() {
  const rows = await sql`
    SELECT 
      status,
      COUNT(*) as total_orders,
      SUM(total) as total_value,
      AVG(total) as avg_order_value,
      COUNT(DISTINCT customer_phone) as unique_customers
    FROM orders
    GROUP BY status
    ORDER BY status
  `
  return rows
}

export async function getOrderQuantityDistribution() {
  const rows = await sql`
    SELECT 
      quantity,
      COUNT(*) as frequency,
      SUM(quantity) as total_quantity,
      AVG(quantity) as avg_quantity_per_order
    FROM (
      SELECT o.id, SUM(oi.quantity) as quantity
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
    ) order_quantities
    GROUP BY quantity
    ORDER BY quantity DESC
  `
  return rows
}

export async function getProductTurnover() {
  const rows = await sql`
    SELECT 
      p.name,
      p.stock,
      COALESCE(SUM(si.quantity), 0) as total_sold,
      p.price,
      CASE 
        WHEN p.stock > 0 THEN (COALESCE(SUM(si.quantity), 0)::float / p.stock)
        ELSE 0 
      END as turnover_ratio
    FROM products p
    LEFT JOIN sale_items si ON p.id = si.product_id
    WHERE p.is_active = true
    GROUP BY p.id, p.name, p.stock, p.price
    ORDER BY turnover_ratio DESC
  `
  return rows
}

export async function getPromotionImpact() {
  const rows = await sql`
    SELECT 
      CASE 
        WHEN COUNT(DISTINCT si.sale_id) >= 12 THEN 'Pack 12+'
        WHEN COUNT(DISTINCT si.sale_id) >= 6 THEN 'Pack 6-11'
        WHEN COUNT(DISTINCT si.sale_id) >= 3 THEN 'Pack 3-5'
        ELSE 'Precio normal'
      END as promotion_tier,
      COUNT(*) as sales_count,
      SUM(total) as total_revenue,
      AVG(total) as avg_sale_value
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    WHERE s.is_test = false
    GROUP BY promotion_tier
    ORDER BY total_revenue DESC
  `
  return rows
}

export async function getRecurringCustomers() {
  const rows = await sql`
    SELECT 
      customer_phone,
      customer_name,
      COUNT(*) as order_count,
      SUM(total) as total_spent,
      AVG(total) as avg_order_value,
      MIN(created_at) as first_order,
      MAX(created_at) as last_order
    FROM orders
    WHERE customer_phone IS NOT NULL
    GROUP BY customer_phone, customer_name
    HAVING COUNT(*) > 1
    ORDER BY order_count DESC, total_spent DESC
  `
  return rows
}

export async function getSalesByDayOfWeek() {
  const rows = await sql`
    SELECT 
      EXTRACT(DOW FROM created_at) as day_of_week,
      CASE 
        WHEN EXTRACT(DOW FROM created_at) = 0 THEN 'Domingo'
        WHEN EXTRACT(DOW FROM created_at) = 1 THEN 'Lunes'
        WHEN EXTRACT(DOW FROM created_at) = 2 THEN 'Martes'
        WHEN EXTRACT(DOW FROM created_at) = 3 THEN 'Miércoles'
        WHEN EXTRACT(DOW FROM created_at) = 4 THEN 'Jueves'
        WHEN EXTRACT(DOW FROM created_at) = 5 THEN 'Viernes'
        WHEN EXTRACT(DOW FROM created_at) = 6 THEN 'Sábado'
      END as day_name,
      COUNT(*) as sales_count,
      SUM(total) as total_revenue,
      AVG(total) as avg_sale_value
    FROM sales
    WHERE is_test = false
    GROUP BY day_of_week, day_name
    ORDER BY day_of_week
  `
  return rows
}

export async function getCriticalStockProducts() {
  const rows = await sql`
    SELECT 
      p.name,
      p.stock,
      COALESCE(SUM(si.quantity), 0) as sold_last_30_days,
      p.price,
      c.name as category
    FROM products p
    LEFT JOIN sale_items si ON p.id = si.product_id 
      AND si.created_at >= NOW() - INTERVAL '30 days'
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
      AND p.stock <= 5
    GROUP BY p.id, p.name, p.stock, p.price, c.name
    ORDER BY sold_last_30_days DESC
  `
  return rows
}

// Task Notes Queries
export async function getTaskNotes(userId: string) {
  return sql`
    SELECT * FROM task_notes
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `
}

export async function createTaskNote(userId: string, title: string, color = 'default') {
  const result = await sql`
    INSERT INTO task_notes (user_id, title, color, items)
    VALUES (${userId}, ${title}, ${color}, ${JSON.stringify([])}::jsonb)
    RETURNING *
  `
  return result[0]
}

export async function updateTaskNote(id: string, userId: string, title: string, items: any[], color: string) {
  const result = await sql`
    UPDATE task_notes
    SET title = ${title}, items = ${JSON.stringify(items)}::jsonb, color = ${color}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return result[0]
}

export async function deleteTaskNote(id: string, userId: string) {
  const result = await sql`
    DELETE FROM task_notes
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return result[0]
}
