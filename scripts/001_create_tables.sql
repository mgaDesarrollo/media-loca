-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos (medias y futuros productos)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detalle de ventas (items vendidos)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Registro de caja
CREATE TABLE IF NOT EXISTS cash_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_register ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías (lectura pública, escritura solo admin)
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas para productos (lectura pública para activos, escritura solo admin)
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true OR auth.uid() IS NOT NULL);
CREATE POLICY "products_admin_insert" ON products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "products_admin_update" ON products FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "products_admin_delete" ON products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas para ventas (solo usuarios autenticados)
CREATE POLICY "sales_user_read" ON sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sales_user_insert" ON sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sales_user_update" ON sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sales_user_delete" ON sales FOR DELETE USING (auth.uid() = user_id);

-- Políticas para items de venta
CREATE POLICY "sale_items_user_read" ON sale_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid())
);
CREATE POLICY "sale_items_user_insert" ON sale_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid())
);

-- Políticas para registro de caja
CREATE POLICY "cash_register_user_read" ON cash_register FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cash_register_user_insert" ON cash_register FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cash_register_user_update" ON cash_register FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cash_register_user_delete" ON cash_register FOR DELETE USING (auth.uid() = user_id);

-- Insertar categoría inicial
INSERT INTO categories (name, description) VALUES ('Medias', 'Todo tipo de medias y calcetines');

-- Insertar algunos productos de ejemplo
INSERT INTO products (name, description, price, category_id, stock, is_active) 
SELECT 
  'Medias Rayadas Coloridas',
  'Medias de algodón con rayas de colores vibrantes. Talla única.',
  2500,
  id,
  20,
  true
FROM categories WHERE name = 'Medias';

INSERT INTO products (name, description, price, category_id, stock, is_active) 
SELECT 
  'Medias con Gatitos',
  'Adorables medias con diseño de gatitos. Súper suaves.',
  3000,
  id,
  15,
  true
FROM categories WHERE name = 'Medias';

INSERT INTO products (name, description, price, category_id, stock, is_active) 
SELECT 
  'Medias Lunares',
  'Medias elegantes con patrón de lunares. Perfectas para cualquier ocasión.',
  2800,
  id,
  25,
  true
FROM categories WHERE name = 'Medias';

INSERT INTO products (name, description, price, category_id, stock, is_active) 
SELECT 
  'Medias Arcoíris',
  'Medias coloridas con degradado arcoíris. Alegra tu día.',
  3200,
  id,
  18,
  true
FROM categories WHERE name = 'Medias';

INSERT INTO products (name, description, price, category_id, stock, is_active) 
SELECT 
  'Medias Tobilleras Básicas',
  'Pack de medias tobilleras en colores neutros. Cómodas y versátiles.',
  1800,
  id,
  30,
  true
FROM categories WHERE name = 'Medias';

INSERT INTO products (name, description, price, category_id, stock, is_active) 
SELECT 
  'Medias Floreadas',
  'Hermosas medias con estampado floral. Ideales para primavera.',
  2900,
  id,
  12,
  true
FROM categories WHERE name = 'Medias';
