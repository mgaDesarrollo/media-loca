'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getPool, sql } from '@/lib/db'
import type { ProfileConfig, PromotionTier, Order, OrderItem } from '@/lib/types'

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
    try {
      revalidatePath(path)
    } catch (error) {
      console.warn(`[revalidateAdmin] Warning revalidating path ${path}:`, error)
    }
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

  let product

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
    product = (await sql`
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
      WHERE p.id = ${data.id}
    `)[0]
  } else {
    const result = await sql`
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
      RETURNING id
    `
    const newId = result[0].id
    product = (await sql`
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
      WHERE p.id = ${newId}
    `)[0]
  }

  revalidateAdmin()
  return { success: true, product }
}

export async function getPromotionTiers(): Promise<PromotionTier[]> {
  await requireAuth()
  const rows = await sql`
    SELECT * FROM promotion_config ORDER BY min_pairs ASC
  `
  return rows as PromotionTier[]
}

export async function upsertPromotionTier(data: Omit<PromotionTier, 'created_at' | 'updated_at'> & { id?: string }) {
  await requireAuth()

  if (data.id) {
    await sql`
      UPDATE promotion_config SET
        min_pairs = ${data.min_pairs},
        max_pairs = ${data.max_pairs},
        price_per_pair = ${data.price_per_pair},
        label = ${data.label},
        is_active = ${data.is_active ?? true},
        updated_at = NOW()
      WHERE id = ${data.id}
    `
  } else {
    await sql`
      INSERT INTO promotion_config (min_pairs, max_pairs, price_per_pair, label, is_active)
      VALUES (${data.min_pairs}, ${data.max_pairs}, ${data.price_per_pair}, ${data.label}, ${data.is_active ?? true})
    `
  }

  revalidateAdmin()
  return { success: true }
}

export async function deletePromotionTier(id: string) {
  await requireAuth()

  await sql`
    DELETE FROM promotion_config WHERE id = ${id}
  `

  revalidateAdmin()
  return { success: true }
}

export async function createOrder(data: {
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  total: number
  notes: string | null
  payment_method: string | null
  items: {
    product_id: string
    quantity: number
    unit_price: number
    subtotal: number
  }[]
}) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const orderResult = await client.query<{ id: string }>(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, total, notes, status, payment_method)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6) RETURNING id`,
      [data.customer_name, data.customer_email, data.customer_phone, data.total, data.notes, data.payment_method],
    )
    const orderId = orderResult.rows[0].id

    for (const item of data.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal],
      )
    }

    await client.query('COMMIT')
    revalidateAdmin()
    return { success: true, orderId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getOrders(): Promise<Order[]> {
  const rows = await sql`
    SELECT o.*, 
           json_agg(
             json_build_object(
               'id', oi.id,
               'order_id', oi.order_id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'subtotal', oi.subtotal,
               'created_at', oi.created_at,
               'products', json_build_object(
                 'id', p.id,
                 'name', p.name,
                 'price', p.price
               )
             )
           ) as order_items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `
  return rows as Order[]
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const rows = await sql`
    SELECT o.*, 
           json_agg(
             json_build_object(
               'id', oi.id,
               'order_id', oi.order_id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'subtotal', oi.subtotal,
               'created_at', oi.created_at,
               'products', json_build_object(
                 'id', p.id,
                 'name', p.name,
                 'price', p.price,
                 'image_url', p.image_url
               )
             )
           ) as order_items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = ${orderId}
    GROUP BY o.id
  `
  return (rows[0] as Order | undefined) ?? null
}

export async function confirmOrder(orderId: string, paymentMethod: string = 'cash') {
  const session = await requireAuth()
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Get order details
    const orderResult = await client.query<Order>(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    )
    const order = orderResult.rows[0]

    if (!order) {
      throw new Error('Pedido no encontrado')
    }

    if (order.status !== 'pending') {
      throw new Error('El pedido ya fue procesado')
    }

    // Get order items
    const itemsResult = await client.query<OrderItem & { current_stock: number }>(
      `SELECT oi.*, p.stock as current_stock
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    )
    const items = itemsResult.rows

    // Validate stock
    for (const item of items) {
      if (item.current_stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto`)
      }
    }

    // Create sale
    const saleResult = await client.query<{ id: string }>(
      `INSERT INTO sales (user_id, total, notes, payment_method, is_test)
       VALUES ($1, $2, $3, $4, false) RETURNING id`,
      [session.user.id, order.total, order.notes, paymentMethod]
    )
    const saleId = saleResult.rows[0].id

    // Add sale items and update stock
    for (const item of items) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.subtotal]
      )

      await client.query(
        `UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [item.quantity, item.product_id]
      )
    }

    // Add to cash register
    await client.query(
      `INSERT INTO cash_register (user_id, type, amount, description, sale_id)
       VALUES ($1, 'sale', $2, $3, $4)`,
      [session.user.id, order.total, `Pedido #${orderId.slice(0, 8)}`, saleId]
    )

    // Update order status and payment method
    await client.query(
      `UPDATE orders SET status = 'confirmed', payment_method = $2, updated_at = NOW() WHERE id = $1`,
      [orderId, paymentMethod]
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

export async function cancelOrder(orderId: string) {
  await requireAuth()

  await sql`
    UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ${orderId}
  `

  revalidateAdmin()
  return { success: true }
}

export async function deleteOrder(orderId: string) {
  await requireAuth()

  await sql`
    DELETE FROM order_items WHERE order_id = ${orderId}
  `
  await sql`
    DELETE FROM orders WHERE id = ${orderId}
  `

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
  payment_method: 'cash' | 'virtual'
  is_test: boolean
}) {
  const session = await requireAuth()
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const saleResult = await client.query<{ id: string }>(
      `INSERT INTO sales (user_id, total, notes, payment_method, is_test) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [session.user.id, data.total, data.notes, data.payment_method, data.is_test],
    )
    const saleId = saleResult.rows[0].id

    for (const item of data.items) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.subtotal],
      )
      // Only update stock if it's not a test sale
      if (!data.is_test) {
        await client.query(
          `UPDATE products SET stock = $1, is_active = CASE WHEN $1 = 0 THEN false ELSE is_active END, updated_at = NOW() WHERE id = $2`,
          [item.new_stock, item.product_id]
        )
      }
    }

    // Only add to cash register if it's not a test sale
    if (!data.is_test) {
      await client.query(
        `INSERT INTO cash_register (user_id, type, amount, description, sale_id)
         VALUES ($1, 'sale', $2, $3, $4)`,
        [session.user.id, data.total, `Venta #${saleId.slice(0, 8)}`, saleId],
      )
    }

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
        app_icon = ${data.app_icon ?? null},
        updated_at = NOW()
      WHERE id = ${data.id}
    `
  } else {
    await sql`
      INSERT INTO profile_config (
        store_name, email, phone, whatsapp, address, description,
        social_facebook, social_instagram, app_icon
      ) VALUES (
        ${data.store_name},
        ${data.email},
        ${data.phone},
        ${data.whatsapp},
        ${data.address},
        ${data.description},
        ${data.social_facebook ?? null},
        ${data.social_instagram ?? null},
        ${data.app_icon ?? null}
      )
    `
  }

  revalidateAdmin()
  return { success: true }
}

export async function getProfileConfigPublic(): Promise<ProfileConfig | null> {
  const rows = await sql`
    SELECT * FROM profile_config ORDER BY created_at ASC LIMIT 1
  `
  return (rows[0] as ProfileConfig | undefined) ?? null
}
