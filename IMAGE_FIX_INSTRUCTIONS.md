# Solución para Imágenes en Producción

## Problema Identificado

Las imágenes se ven en localhost pero no en la web porque:

1. **Variable `BLOB_READ_WRITE_TOKEN` está vacía** en `.env`
2. Cuando no está configurado Vercel Blob Storage, las imágenes se guardan en `public/uploads/` (local)
3. La carpeta `public/uploads/` no se sincroniza con el servidor de producción
4. Cada despliegue borra las imágenes locales
5. Vercel tiene sistema de archivos read-only, por eso el endpoint `/api/upload` falla con error 500

## Solución: Configurar Vercel Blob Storage

### Paso 1: Crear Store en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. En tu proyecto, ve a la sección **Storage**
3. Clic en **Create Database** o **Add Integration**
4. Selecciona **Blob Storage**
5. Crea el store (puede ser gratuito para uso básico)

### Paso 2: Obtener las Variables de Entorno

Después de crear el Blob Storage, Vercel te proporcionará estas variables:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 3: Configurar Variables de Entorno

#### En Vercel Dashboard:

1. Ve a tu proyecto
2. Clic en **Settings** → **Environment Variables**
3. Agrega la variable:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: (el valor que te dio Vercel)
4. Clic en **Save**
5. Redespliega tu proyecto

#### Localmente (opcional):

Actualiza tu archivo `.env`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 4: Verificar Configuración

El código en `app/api/upload/route.ts` ya está configurado para usar Vercel Blob Storage:

```typescript
if (process.env.BLOB_READ_WRITE_TOKEN) {
  const blob = await put(`products/${fileName}`, file, { access: 'public' })
  return Response.json({ url: blob.url })
}
```

### Paso 5: Migrar Imágenes Existentes

**IMPORTANTE**: Las imágenes actuales en `public/uploads/` no se migran automáticamente. Debes:

1. **Descargar las imágenes locales**:
   - Ve a la carpeta `public/uploads/` en tu proyecto
   - Descarga todas las imágenes

2. **Actualizar las URLs en la base de datos**:
   - Ejecuta el script de migración: `npm run migrate-images`
   - Este script subirá las imágenes a Vercel Blob Storage y actualizará las URLs en la base de datos

3. **O manualmente**:
   - Ve al panel admin
   - Edita cada producto
   - Súbelas nuevamente desde el panel admin
   - Las nuevas imágenes se guardarán en Vercel Blob Storage

## Alternativa: Usar URLs Externas

Si no quieres configurar Vercel Blob Storage, puedes usar URLs externas:

1. Sube las imágenes a servicios como:
   - Cloudinary (gratis hasta cierto límite)
   - Imgur
   - AWS S3
   - Google Cloud Storage

2. En el panel admin, usa la opción **URL** en lugar de **Archivo** al agregar productos
3. Pega la URL de la imagen externa

## Verificación

Después de configurar:

1. Ve al panel admin
2. Crea un nuevo producto con imagen
3. Verifica que la URL de la imagen sea algo como:
   - `https://xxxxxxxxx.public.blob.vercel-storage.com/products/xxxxx.jpg`
4. Despliega y verifica que la imagen se vea en producción

## Notas Importantes

- Vercel Blob Storage es gratuito hasta 500GB de almacenamiento
- Las URLs de Blob Storage son públicas y accesibles desde cualquier lugar
- No necesitas configurar nada en `next.config.mjs` para Blob Storage
- El código ya maneja el fallback a almacenamiento local para desarrollo
- El endpoint de upload ahora muestra un error claro cuando no se puede guardar la imagen
