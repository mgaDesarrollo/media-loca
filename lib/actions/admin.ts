'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getPool, sql } from '@/lib/db'
import type { ProfileConfig } from '@/lib/types'

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autorizado')
  }
  return session
}

function revalidateAdmin(paths: string[] = []) {
  const defaults = [
    '/',
    '/catalogo',
    '/admin',
    '/admin/productos',
    '/admin/categorias',
    '/admin/stock',
    '/admin/ventas',
    '/admin/caja',
    '/admin/perfil',
  ]
  for (const path of [...defaults, ...paths]) {
    revalidatePath(path)
  }
}

export async function upsertProduct(data: {
  id?: string
  name: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  is_active: boolean
  image_url: string | null
}) {
  await requireAuth()

  if (data.id) {
    await sql`
      UPDATE products SET
        name = ${data.name},
        description = ${data.description},
        price = ${data.price},
        stock = ${data.stock},
        category_id = ${data.category_id},
        is_active = CASE WHEN ${data.stock} = 0 THEN false ELSE ${data.is_active} END,
        image_url = ${data.image_url},
        updated_at = NOW()
      WHERE id = ${data.id}
    `
  } else {
    await sql`
      INSERT INTO products (name, description, price, stock, category_id, is_active, image_url)
      VALUES (
        ${data.name},
        ${data.description},
        ${data.price},
        ${data.stock},
        ${data.category_id},
        CASE WHEN ${data.stock} = 0 THEN false ELSE ${data.is_active} END,
        ${data.image_url}
      )
    `
  }

  revalidateAdmin()
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAuth()
  await sql`DELETE FROM products WHERE id = ${id}`
  revalidateAdmin()
  return { success: true }
}

export async function upsertCategory(data: {
  id?: string
  name: string
  description: string | null
  is_active: boolean
}) {
  await requireAuth()

  if (data.id) {
    await sql`
      UPDATE categories SET
        name = ${data.name},
        description = ${data.description},
        is_active = ${data.is_active},
        updated_at = NOW()
      WHERE id = ${data.id}
    `
  } else {
    await sql`
      INSERT INTO categories (name, description, is_active)
      VALUES (${data.name}, ${data.description}, ${data.is_active})
    `
  }

  revalidateAdmin()
  return { success: true }
}

export async function deleteCategory(id: string) {
  await requireAuth()
  await sql`DELETE FROM categories WHERE id = ${id}`
  revalidateAdmin()
  return { success: true }
}

export async function updateProductStock(id: string, stock: number) {
  await requireAuth()
  await sql`
    UPDATE products SET 
      stock = ${stock}, 
      is_active = CASE WHEN ${stock} = 0 THEN false ELSE is_active END,
      updated_at = NOW() 
    WHERE id = ${id}
  `
  revalidateAdmin()
  return { success: true }
}

export async function createCashEntry(data: {
  type: 'income' | 'expense' | 'adjustment'
  amount: number
  description: string | null
}) {
  const session = await requireAuth()

  await sql`
    INSERT INTO cash_register (user_id, type, amount, description)
    VALUES (${session.user.id}, ${data.type}, ${data.amount}, ${data.description})
  `

  revalidateAdmin()
  return { success: true }
}

export async function createSale(data: {
  total: number
  notes: string | null
  items: {
    product_id: string
    quantity: number
    unit_price: number
    subtotal: number
    new_stock: number
  }[]
}) {
  const session = await requireAuth()
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const saleResult = await client.query<{ id: string }>(
      `INSERT INTO sales (user_id, total, notes) VALUES ($1, $2, $3) RETURNING id`,
      [session.user.id, data.total, data.notes],
    )
    const saleId = saleResult.rows[0].id

    for (const item of data.items) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.subtotal],
      )
      await client.query(
        `UPDATE products SET stock = $1, is_active = CASE WHEN $1 = 0 THEN false ELSE is_active END, updated_at = NOW() WHERE id = $2`,
        [item.new_stock, item.product_id]
      )
    }

    await client.query(
      `INSERT INTO cash_register (user_id, type, amount, description, sale_id)
       VALUES ($1, 'sale', $2, $3, $4)`,
      [session.user.id, data.total, `Venta #${saleId.slice(0, 8)}`, saleId],
    )

    await client.query('COMMIT')
    revalidateAdmin()
    return { success: true, saleId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function upsertProfileConfig(
  data: Omit<ProfileConfig, 'id' | 'created_at' | 'updated_at'> & { id?: string },
) {
  await requireAuth()

  if (data.id) {
    await sql`
      UPDATE profile_config SET
        store_name = ${data.store_name},
        email = ${data.email},
        phone = ${data.phone},
        whatsapp = ${data.whatsapp},
        address = ${data.address},
        description = ${data.description},
        social_facebook = ${data.social_facebook ?? null},
        social_instagram = ${data.social_instagram ?? null},
        updated_at = NOW()
      WHERE id = ${data.id}
    `
  } else {
    await sql`
      INSERT INTO profile_config (
        store_name, email, phone, whatsapp, address, description,
        social_facebook, social_instagram
      ) VALUES (
        ${data.store_name},
        ${data.email},
        ${data.phone},
        ${data.whatsapp},
        ${data.address},
        ${data.description},
        ${data.social_facebook ?? null},
        ${data.social_instagram ?? null}
      )
    `
  }

  revalidateAdmin()
  return { success: true }
}
