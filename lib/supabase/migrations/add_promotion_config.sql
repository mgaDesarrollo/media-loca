-- Crear tabla de configuración de promociones
CREATE TABLE IF NOT EXISTS promotion_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  min_pairs INTEGER NOT NULL,
  max_pairs INTEGER NOT NULL,
  price_per_pair DECIMAL(10,2) NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración de promociones por defecto
INSERT INTO promotion_config (min_pairs, max_pairs, price_per_pair, label, is_active) VALUES
(1, 2, 0, 'Precio normal', true),
(3, 5, 3800, 'Pack 3-5 pares', true),
(6, 11, 3500, 'Pack 6-11 pares', true),
(12, 999999, 3200, 'Pack 12+ pares', true)
ON CONFLICT DO NOTHING;
