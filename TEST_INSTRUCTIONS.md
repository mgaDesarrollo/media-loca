# Instrucciones de Prueba - Sistema de Pedidos

## Cambios Implementados

### 1. Favicon de Medias
- Actualizado `public/icon.svg` con diseño de medias
- Colores de marca: #F8B4D9 (rosa) y #1a1a1a (oscuro)

### 2. Sistema de Pedidos
- **Base de datos**: Tablas `orders` y `order_items`
- **Tipos**: `Order` y `OrderItem` en `lib/types.ts`
- **Acciones**: `createOrder`, `getOrders`, `confirmOrder`, `cancelOrder` en `lib/actions/admin.ts`
- **Carrito**: Modificado para crear pedidos al hacer checkout
- **Panel admin**: Nueva página `/admin/pedidos` para gestionar pedidos
- **Dashboard**: Link a "Ver pedidos" agregado

## Pasos para Probar

### Paso 1: Aplicar Migración a la Base de Datos

Ejecutar el script SQL en tu base de datos:

```bash
# Si usas Supabase SQL Editor, copia y ejecuta el contenido de:
# lib/supabase/migrations/add_orders_tables.sql
```

O ejecutar directamente en tu cliente SQL:

```sql
-- Pedidos de clientes
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items de pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campos a tabla sales si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE sales ADD COLUMN payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'virtual')) DEFAULT 'cash';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'is_test'
  ) THEN
    ALTER TABLE sales ADD COLUMN is_test BOOLEAN DEFAULT false;
  END IF;
END $$;
```

### Paso 2: Verificar Favicon

1. Iniciar la aplicación: `npm run dev`
2. Abrir el navegador en `http://localhost:3000`
3. Verificar que el icono de la pestaña sea el de medias

### Paso 3: Probar Creación de Pedidos

1. Navegar al catálogo: `http://localhost:3000/catalogo`
2. Agregar productos al carrito
3. Abrir el carrito (botón flotante)
4. Hacer clic en "Enviar pedido por WhatsApp"
5. Verificar que:
   - Se abra WhatsApp con el mensaje incluyendo el número de pedido
   - El carrito se vacíe
   - No haya errores en la consola

### Paso 4: Probar Gestión de Pedidos en Admin

1. Iniciar sesión en el panel admin: `http://localhost:3000/admin`
2. Navegar a "Ver pedidos" o ir directamente a `http://localhost:3000/admin/pedidos`
3. Verificar que:
   - El pedido creado aparezca en la lista
   - El estado sea "Pendiente"
   - Se muestren los items del pedido
   - Se muestre el total

### Paso 5: Probar Confirmación de Pedido

1. En la página de pedidos, hacer clic en "Confirmar" en un pedido pendiente
2. Verificar que:
   - El estado cambie a "Confirmado"
   - Se cree una venta en el sistema
   - El stock de los productos se descuenten
   - Se registre en caja
   - No haya errores

### Paso 6: Probar Cancelación de Pedido

1. Crear otro pedido desde el catálogo
2. En la página de pedidos, hacer clic en "Cancelar"
3. Verificar que:
   - El estado cambie a "Cancelado"
   - No se descuenten stocks
   - No se registre en caja

### Paso 7: Probar Validación de Stock

1. Crear un pedido con más cantidad de la que hay en stock
2. Intentar confirmar el pedido
3. Verificar que:
   - Aparezca un error indicando stock insuficiente
   - El pedido no se confirme
   - El stock no se modifique

## Checklist de Verificación

- [ ] Favicon de medias visible en el navegador
- [ ] Tablas `orders` y `order_items` creadas en la base de datos
- [ ] Campos `payment_method` y `is_test` agregados a tabla `sales`
- [ ] Carrito crea pedidos correctamente
- [ ] WhatsApp incluye número de pedido
- [ ] Página `/admin/pedidos` carga sin errores
- [ ] Lista de pedidos muestra correctamente
- [ ] Confirmación de pedido funciona y descuenta stock
- [ ] Cancelación de pedido funciona
- [ ] Validación de stock funciona
- [ ] Dashboard tiene link a "Ver pedidos"

## Posibles Errores y Soluciones

### Error: "relation 'orders' does not exist"
**Solución**: Ejecutar el script de migración SQL para crear las tablas

### Error: "column 'payment_method' does not exist"
**Solución**: Ejecutar el script de migración para agregar los campos a la tabla sales

### Error: "Module not found: @/lib/actions/admin"
**Solución**: Verificar que el archivo `lib/actions/admin.ts` exista y tenga las funciones exportadas

### Error: "Type 'Order' does not exist"
**Solución**: Verificar que los tipos estén definidos en `lib/types.ts`

## Notas

- Los pedidos creados desde el catálogo tienen `customer_name`, `customer_email` y `customer_phone` en null
- El número de pedido se muestra como los primeros 8 caracteres del UUID
- Las promociones se aplican al crear el pedido
- El modo prueba en ventas no afecta a los pedidos (los pedidos son siempre reales)
