-- Crear tabla para configuración del perfil
CREATE TABLE IF NOT EXISTS profile_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT 'Media Loca',
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  description TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial si no existe
INSERT INTO profile_config (store_name, email, phone, whatsapp, address, description)
VALUES (
  'Media Loca',
  'contacto@medialoca.com',
  '+54 11 1234-5678',
  '+54 9 11 1234-5678',
  'Av. Corrientes 1234, CABA, Argentina',
  'Somos una tienda especializada en medias únicas y divertidas. Calidad, estilo y comodidad en cada par.'
)
ON CONFLICT DO NOTHING;

-- Actualizar categorías para agregar is_active y updated_at
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Actualizar categorías existentes
UPDATE categories 
SET is_active = true, updated_at = NOW() 
WHERE is_active IS NULL;
