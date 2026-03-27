'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Globe, Building, Save } from 'lucide-react'

interface ProfileConfig {
  id?: string
  store_name: string
  email: string
  phone: string
  whatsapp: string
  address: string
  description: string
  social_facebook?: string
  social_instagram?: string
  updated_at?: string
}

interface ProfileManagerProps {
  initialConfig: ProfileConfig | null
}

export function ProfileManager({ initialConfig }: ProfileManagerProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState<ProfileConfig>({
    store_name: initialConfig?.store_name || 'Media Loca',
    email: initialConfig?.email || '',
    phone: initialConfig?.phone || '',
    whatsapp: initialConfig?.whatsapp || '',
    address: initialConfig?.address || '',
    description: initialConfig?.description || '',
    social_facebook: initialConfig?.social_facebook || '',
    social_instagram: initialConfig?.social_instagram || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (initialConfig?.id) {
        // Actualizar configuración existente
        const { error } = await supabase
          .from('profile_config')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialConfig.id)

        if (error) throw error
        toast.success('Perfil actualizado correctamente')
      } else {
        // Crear nueva configuración
        const { error } = await supabase
          .from('profile_config')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
          })

        if (error) throw error
        toast.success('Perfil creado correctamente')
      }
    } catch (error) {
      toast.error('Error al guardar el perfil')
      console.error('Error:', error)
    }

    setLoading(false)
  }

  const InfoCard = ({ 
    title, 
    icon: Icon, 
    children 
  }: { 
    title: string
    icon: any
    children: React.ReactNode 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <InfoCard title="Información Básica" icon={Building}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="store_name">Nombre de la Tienda</FieldLabel>
            <Input
              id="store_name"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              placeholder="Media Loca"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Somos una tienda especializada en medias únicas y divertidas..."
              rows={3}
            />
          </Field>
        </FieldGroup>
      </InfoCard>

      {/* Contacto */}
      <InfoCard title="Contacto" icon={Mail}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email Principal</FieldLabel>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contacto@medialoca.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+54 11 1234-5678"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
            <Input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+54 9 11 1234-5678"
            />
          </Field>
        </FieldGroup>
      </InfoCard>

      {/* Ubicación */}
      <InfoCard title="Ubicación" icon={MapPin}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="address">Dirección</FieldLabel>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Corrientes 1234, CABA, Argentina"
              rows={2}
            />
          </Field>
        </FieldGroup>
      </InfoCard>

      {/* Redes Sociales */}
      <InfoCard title="Redes Sociales" icon={Globe}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="social_facebook">Facebook</FieldLabel>
            <Input
              id="social_facebook"
              value={formData.social_facebook}
              onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
              placeholder="https://facebook.com/medialoca"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="social_instagram">Instagram</FieldLabel>
            <Input
              id="social_instagram"
              value={formData.social_instagram}
              onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
              placeholder="https://instagram.com/medialoca"
            />
          </Field>
        </FieldGroup>
      </InfoCard>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg" className="gap-2">
          {loading && <Spinner className="h-4 w-4" />}
          <Save className="h-4 w-4" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}
