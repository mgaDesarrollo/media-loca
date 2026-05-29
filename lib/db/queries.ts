import { sql } from '@/lib/db'
import type {
  CashRegisterEntry,
  Category,
  Product,
  ProfileConfig,
  Sale,
  SaleItem,
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
