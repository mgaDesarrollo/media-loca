-- Arreglar foreign key de order_items.product_id para permitir borrado de productos
-- Cambia de restricción sin acción (que bloquea el borrado) a SET NULL (preserva historial)

-- Eliminar el constraint existente
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Recrear con ON DELETE SET NULL (el historial de pedidos queda, pero product_id queda en NULL)
ALTER TABLE order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES products(id)
  ON DELETE SET NULL;
