import { createClient } from '@/lib/supabase/server'
import { ProfileManager } from './profile-manager'

export default async function PerfilPage() {
  const supabase = await createClient()

  // Obtener configuración del perfil desde una tabla de configuración
  const { data: profileConfig } = await supabase
    .from('profile_config')
    .select('*')
    .single()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Perfil de la Tienda</h1>
        <p className="text-muted-foreground">
          Configura los datos de contacto y información principal
        </p>
      </div>

      <ProfileManager initialConfig={profileConfig} />
    </div>
  )
}
