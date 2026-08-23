'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertProfileConfig } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Mail, MapPin, Globe, Building, Save, Upload, Image as ImageIcon } from 'lucide-react'
import type { ProfileConfig } from '@/lib/types'

interface InfoCardProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

const InfoCard = ({ title, icon: Icon, children }: InfoCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

interface ProfileManagerProps {
  initialConfig: ProfileConfig | null
}

export function ProfileManager({ initialConfig }: ProfileManagerProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    store_name: initialConfig?.store_name || 'Media Loca',
    email: initialConfig?.email || '',
    phone: initialConfig?.phone || '',
    whatsapp: initialConfig?.whatsapp || '',
    address: initialConfig?.address || '',
    description: initialConfig?.description || '',
    social_facebook: initialConfig?.social_facebook || '',
    social_instagram: initialConfig?.social_instagram || '',
    app_icon: initialConfig?.app_icon || '',
    carousel_images: initialConfig?.carousel_images || [],
  })

  const handleCarouselImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          carousel_images: [...(prev.carousel_images || []), reader.result as string],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeCarouselImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      carousel_images: (prev.carousel_images || []).filter((_, i) => i !== index),
    }))
  }

  const moveCarouselImage = (index: number, direction: 'up' | 'down') => {
    const images = [...(formData.carousel_images || [])]
    if (direction === 'up' && index > 0) {
      const temp = images[index]
      images[index] = images[index - 1]
      images[index - 1] = temp
    } else if (direction === 'down' && index < images.length - 1) {
      const temp = images[index]
      images[index] = images[index + 1]
      images[index + 1] = temp
    }
    setFormData((prev) => ({
      ...prev,
      carousel_images: images,
    }))
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        app_icon: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        id: initialConfig?.id,
        store_name: formData.store_name,
        email: formData.email,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        address: formData.address || null,
        description: formData.description || null,
        social_facebook: formData.social_facebook || null,
        social_instagram: formData.social_instagram || null,
        app_icon: formData.app_icon || null,
        carousel_images: formData.carousel_images || [],
      }
      await upsertProfileConfig(JSON.stringify(payload))
      toast.success('Perfil guardado correctamente')
      router.refresh()
    } catch {
      toast.error('Error al guardar el perfil')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <InfoCard title="Imagen / Icono de la Aplicación" icon={ImageIcon}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Esta imagen se utilizará como el icono de la pestaña del navegador (favicon) y como el icono oficial de la aplicación móvil cuando los usuarios la instalen (PWA). Se recomienda usar una imagen cuadrada de alta calidad (ej. 512x512 px) en formato PNG.
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium shadow-sm">
                <Upload className="h-4 w-4" />
                Subir Archivo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleIconChange}
                />
              </label>
              {formData.app_icon && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, app_icon: '' })}
                >
                  Restablecer
                </Button>
              )}
            </div>
          </div>
          <div className="relative flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50 w-32 h-32 flex-shrink-0">
            {formData.app_icon ? (
              <img
                src={formData.app_icon}
                alt="Vista previa del icono"
                className="w-24 h-24 object-contain rounded-lg shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400 text-xs">
                <ImageIcon className="h-8 w-8 opacity-40" />
                <span>Por defecto</span>
              </div>
            )}
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Imágenes del Carrusel de la Página Principal" icon={ImageIcon}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sube las imágenes que se mostrarán en el carrusel de la página principal (debajo de los productos). Se recomienda usar imágenes apaisadas de buena resolución. Puedes subir varias y ordenarlas.
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium shadow-sm">
              <Upload className="h-4 w-4" />
              Subir Imágenes
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleCarouselImagesChange}
              />
            </label>
          </div>

          {formData.carousel_images && formData.carousel_images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.carousel_images.map((image, index) => (
                <div key={index} className="relative group border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 aspect-video flex items-center justify-center">
                  <img
                    src={image}
                    alt={`Carrusel ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCarouselImage(index)}
                      className="h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => moveCarouselImage(index, 'up')}
                        className="h-8 w-8 p-0 font-bold"
                      >
                        ←
                      </Button>
                    )}
                    {index < formData.carousel_images.length - 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => moveCarouselImage(index, 'down')}
                        className="h-8 w-8 p-0 font-bold"
                      >
                        →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </InfoCard>

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
