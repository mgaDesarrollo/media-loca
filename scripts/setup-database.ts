import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

// Cargar variables de entorno
dotenv.config({ path: '.env' })

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    console.log('🔧 Configurando base de datos...')
    
    // Leer el schema SQL
    const schema = readFileSync('./lib/supabase/schema.sql', 'utf8')
    
    // Nota: Esto es un ejemplo. En producción deberías usar migraciones de Supabase
    console.log('📋 Schema SQL generado:')
    console.log(schema)
    
    console.log('\n✅ Para completar la configuración:')
    console.log('1. Ve a https://swafdxujaogxiptgivyj.supabase.co')
    console.log('2. Ve a SQL Editor')
    console.log('3. Copia y pega el contenido de lib/supabase/schema.sql')
    console.log('4. Ejecuta el script')
    console.log('5. Ve a Authentication > Users para verificar el usuario admin')
    
    console.log('\n🔑 Credenciales del usuario admin:')
    console.log('Email: admin@medialoca.com')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

setupDatabase().catch(console.error)
