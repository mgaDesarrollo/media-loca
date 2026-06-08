-- Agregar campo payment_method a la tabla orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
