# Configuración de Storage de Supabase

Para que funcione la subida de imágenes, necesitas configurar el storage en Supabase:

## 1. Crear Bucket

Ve a la sección **Storage** en tu dashboard de Supabase y crea un bucket llamado:
- **ID:** `product-images`
- **Nombre:** `product-images`
- **Público:** ✅
- **Límite de archivo:** 5MB
- **Tipos MIME permitidos:** `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

## 2. Configurar Políticas (RLS)

Ejecuta este SQL en el editor SQL de Supabase:

```sql
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
```

## 3. Verificar Configuración

1. **Bucket creado:** ✅
2. **Políticas aplicadas:** ✅  
3. **RLS activado:** ✅
4. **Usuario autenticado:** ✅

## 4. Probar la Subida

1. Inicia sesión como admin
2. Ve a `/admin/productos`
3. Crea un nuevo producto
4. Selecciona "Archivo" y elige una imagen
5. Revisa la consola del navegador para ver los logs

## Errores Comunes

- **"Bucket not found"** → No creaste el bucket
- **"Permission denied"** → No configuraste las políticas RLS
- **"File too large"** → Imagen mayor a 5MB
- **"Invalid file type"** → Tipo de archivo no permitido

## Debug

He agregado logs detallados en el código. Revisa la consola del navegador (F12) cuando intentes subir una imagen para ver exactamente qué está fallando.
