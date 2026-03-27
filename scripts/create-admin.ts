import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env' })

async function createAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const email = 'admin@medialoca.com'
  const password = 'admin123'
  
  try {
    // Crear el usuario
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Administrador'
      }
    })
    
    if (error) {
      console.error('Error creando usuario admin:', error)
      return
    }
    
    console.log('✅ Usuario admin creado exitosamente!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👤 User ID: ${data.user?.id}`)
  } catch (err) {
    console.error('Error:', err)
  }
}

createAdminUser().catch(console.error)
