-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso para el bucket
-- Permitir lectura pública
CREATE POLICY "public-read-product-images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Permitir a usuarios autenticados subir imágenes
CREATE POLICY "authenticated-users-upload-product-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Permitir a usuarios autenticados actualizar sus propias imágenes
CREATE POLICY "authenticated-users-update-product-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Permitir a usuarios autenticados eliminar sus propias imágenes
CREATE POLICY "authenticated-users-delete-product-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
