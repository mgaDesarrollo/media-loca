-- Crear tablas para Media Loca

-- Categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ventas
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items de venta
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registro de caja
CREATE TABLE IF NOT EXISTS cash_register (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  sale_id UUID REFERENCES sales(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías de ejemplo
INSERT INTO categories (name, description) VALUES
('Clásicas', 'Medias tradicionales y elegantes'),
('Divertidas', 'Diseños coloridos y originales'),
('Deportivas', 'Medias para actividad física'),
('Temporada', 'Colecciones especiales de temporada')
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category_id, stock, is_active) VALUES
('Medias Rayas Clásicas', 'Medias con rayas horizontales en colores neutros', 1500.00, (SELECT id FROM categories WHERE name = 'Clásicas'), 50, true),
('Medias Gatos', 'Medias con divertidos estampados de gatos', 1800.00, (SELECT id FROM categories WHERE name = 'Divertidas'), 30, true),
('Medias Deportivas Negras', 'Medias técnicas para running', 2200.00, (SELECT id FROM categories WHERE name = 'Deportivas'), 25, true),
('Medas Navideñas', 'Pack especial de Navidad con motivos festivos', 2500.00, (SELECT id FROM categories WHERE name = 'Temporada'), 20, true)
ON CONFLICT DO NOTHING;

-- Crear usuario admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'profile.curriculum@gmail.com',
  crypt('Mamichul4', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin", "name": "Administrador"}'
)
ON CONFLICT (email) DO NOTHING;
