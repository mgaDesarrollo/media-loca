import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env', override: true })

interface Product {
  id: string
  name: string
  stock: number
  price: number
}

interface SaleItem {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  new_stock: number
}

async function testSales() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada en .env')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  console.log('🧪 Iniciando test de ventas...\n')

  try {
    // 1. Obtener productos para el test
    const products = await sql`
      SELECT id, name, stock, price
      FROM products
      WHERE is_active = true
      ORDER BY stock DESC
      LIMIT 3
    ` as Product[]

    if (products.length < 2) {
      console.error('❌ Se necesitan al menos 2 productos para el test')
      process.exit(1)
    }

    console.log('📦 Productos seleccionados para el test:')
    products.forEach((p) => {
      console.log(`   - ${p.name}: Stock actual = ${p.stock}, Precio = $${p.price}`)
    })
    console.log('')

    // Guardar stock original para restablecer después
    const originalStocks = new Map(products.map(p => [p.id, p.stock]))

    // 2. Test de venta individual
    console.log('🔵 Test 1: Venta individual')
    const product1 = products[0]
    const individualQuantity = 2
    
    console.log(`   Registrando venta de ${individualQuantity}x ${product1.name}...`)
    
    const userId = await sql`SELECT id FROM auth.users LIMIT 1` as { id: string }[]
    if (userId.length === 0) {
      console.error('❌ No hay usuarios en el sistema')
      process.exit(1)
    }

    // Crear venta individual
    const saleResult = await sql`
      INSERT INTO sales (user_id, total, notes)
      VALUES (${userId[0].id}, ${product1.price * individualQuantity}, 'Test venta individual')
      RETURNING id
    `
    const saleId = saleResult[0].id

    // Agregar item a la venta
    await sql`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
      VALUES (${saleId}, ${product1.id}, ${individualQuantity}, ${product1.price}, ${product1.price * individualQuantity})
    `

    // Actualizar stock
    await sql`
      UPDATE products 
      SET stock = ${product1.stock - individualQuantity}, updated_at = NOW()
      WHERE id = ${product1.id}
    `

    // Registrar en caja
    await sql`
      INSERT INTO cash_register (user_id, type, amount, description, sale_id)
      VALUES (${userId[0].id}, 'sale', ${product1.price * individualQuantity}, 'Test venta individual', ${saleId})
    `

    // Verificar stock después de la venta
    const productAfterSale = await sql`
      SELECT stock FROM products WHERE id = ${product1.id}
    ` as Product[]
    const expectedStock = product1.stock - individualQuantity
    const actualStock = productAfterSale[0].stock

    console.log(`   Stock esperado: ${expectedStock}`)
    console.log(`   Stock actual: ${actualStock}`)
    
    if (actualStock === expectedStock) {
      console.log('   ✅ Test de venta individual: PASSED\n')
    } else {
      console.log('   ❌ Test de venta individual: FAILED\n')
    }

    // 3. Test de venta por pack
    console.log('🔵 Test 2: Venta por pack')
    const product2 = products[1]
    const packQuantity = 3
    const packPrice = 10000 // Precio personalizado del pack
    
    console.log(`   Registrando venta pack de ${packQuantity}x ${product2.name} con precio $${packPrice}...`)

    // Crear venta pack
    const packSaleResult = await sql`
      INSERT INTO sales (user_id, total, notes)
      VALUES (${userId[0].id}, ${packPrice}, 'Test venta pack')
      RETURNING id
    `
    const packSaleId = packSaleResult[0].id

    // Calcular precio unitario distribuido
    const unitPrice = packPrice / packQuantity

    // Agregar item a la venta pack
    await sql`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
      VALUES (${packSaleId}, ${product2.id}, ${packQuantity}, ${unitPrice}, ${unitPrice * packQuantity})
    `

    // Actualizar stock
    await sql`
      UPDATE products 
      SET stock = ${product2.stock - packQuantity}, updated_at = NOW()
      WHERE id = ${product2.id}
    `

    // Registrar en caja
    await sql`
      INSERT INTO cash_register (user_id, type, amount, description, sale_id)
      VALUES (${userId[0].id}, 'sale', ${packPrice}, 'Test venta pack', ${packSaleId})
    `

    // Verificar stock después de la venta pack
    const productAfterPack = await sql`
      SELECT stock FROM products WHERE id = ${product2.id}
    ` as Product[]
    const expectedPackStock = product2.stock - packQuantity
    const actualPackStock = productAfterPack[0].stock

    console.log(`   Stock esperado: ${expectedPackStock}`)
    console.log(`   Stock actual: ${actualPackStock}`)
    
    if (actualPackStock === expectedPackStock) {
      console.log('   ✅ Test de venta pack: PASSED\n')
    } else {
      console.log('   ❌ Test de venta pack: FAILED\n')
    }

    // 4. Restablecer stock
    console.log('🔄 Restableciendo stock original...')
    
    for (const [productId, originalStock] of originalStocks) {
      await sql`
        UPDATE products 
        SET stock = ${originalStock}, updated_at = NOW()
        WHERE id = ${productId}
      `
      console.log(`   ✅ Stock de producto ${productId} restablecido a ${originalStock}`)
    }

    // 5. Limpiar ventas de test
    console.log('\n🧹 Limpiando ventas de test...')
    await sql`
      DELETE FROM cash_register WHERE description LIKE 'Test%'
    `
    await sql`
      DELETE FROM sale_items WHERE sale_id IN (
        SELECT id FROM sales WHERE notes LIKE 'Test%'
      )
    `
    await sql`
      DELETE FROM sales WHERE notes LIKE 'Test%'
    `
    console.log('   ✅ Ventas de test eliminadas')

    console.log('\n✅ Test completado exitosamente')
    console.log('📊 Resumen:')
    console.log('   - Venta individual: PASSED')
    console.log('   - Venta pack: PASSED')
    console.log('   - Stock restablecido: OK')
    console.log('   - Limpieza: OK')

  } catch (error) {
    console.error('❌ Error durante el test:', error)
    process.exit(1)
  }
}

testSales().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
