import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env' })

async function createAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here') {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada correctamente')
    console.log('\n🔧 Para obtener la SERVICE_ROLE_KEY:')
    console.log('1. Ve a https://swafdxujaogxiptgivyj.supabase.co')
    console.log('2. Ve a Project Settings > API')
    console.log('3. Copia la "service_role" key')
    console.log('4. Agrégala al archivo .env como SUPABASE_SERVICE_ROLE_KEY=tu_key')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const email = 'profile.curriculum@gmail.com'
  const password = 'Mamichul4'
  
  try {
    // Primero verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      console.log('✅ El usuario admin ya existe')
      console.log(`📧 Email: ${email}`)
      console.log(`🔑 Password: ${password}`)
      return
    }
    
    // Crear el usuario usando el método correcto
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
      console.error('❌ Error creando usuario admin:', error)
      return
    }
    
    console.log('✅ Usuario admin creado exitosamente!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👤 User ID: ${data.user?.id}`)
    
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

createAdminUser().catch(console.error)
