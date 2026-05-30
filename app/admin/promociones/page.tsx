'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { getPromotionTiers, upsertPromotionTier, deletePromotionTier } from '@/lib/actions/admin'
import { setPromotionTiers, type PromotionTier } from '@/lib/promotions'
import type { PromotionTier as DBPromotionTier } from '@/lib/types'

export default function PromocionesPage() {
  const router = useRouter()
  const [tiers, setTiers] = useState<DBPromotionTier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingTier, setEditingTier] = useState<PromotionTier | null>(null)

  useEffect(() => {
    loadTiers()
  }, [])

  const loadTiers = async () => {
    try {
      const data = await getPromotionTiers()
      setTiers(data)
      const mappedTiers = data.map(t => ({
        id: t.id,
        minPairs: t.min_pairs,
        maxPairs: t.max_pairs,
        pricePerPair: t.price_per_pair,
        label: t.label,
        isActive: t.is_active,
      }))
      setPromotionTiers(mappedTiers)
    } catch {
      toast.error('Error al cargar las promociones')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (tier: PromotionTier) => {
    setSaving(true)
    try {
      const dbTier: Omit<DBPromotionTier, 'created_at' | 'updated_at'> & { id?: string } = {
        ...(tier.id ? { id: tier.id } : {}),
        min_pairs: tier.minPairs,
        max_pairs: tier.maxPairs,
        price_per_pair: tier.pricePerPair,
        label: tier.label,
        is_active: tier.isActive ?? true,
      }
      await upsertPromotionTier(dbTier)
      toast.success('Promoción guardada')
      await loadTiers()
      setEditingTier(null)
    } catch {
      toast.error('Error al guardar la promoción')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return
    
    setSaving(true)
    try {
      await deletePromotionTier(id)
      toast.success('Promoción eliminada')
      await loadTiers()
    } catch {
      toast.error('Error al eliminar la promoción')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNew = () => {
    const newTier: PromotionTier = {
      minPairs: 0,
      maxPairs: 0,
      pricePerPair: 0,
      label: 'Nueva promoción',
      isActive: true,
    }
    setEditingTier(newTier)
  }

  const handleEdit = (dbTier: DBPromotionTier) => {
    const tier: PromotionTier = {
      id: dbTier.id,
      minPairs: dbTier.min_pairs,
      maxPairs: dbTier.max_pairs,
      pricePerPair: dbTier.price_per_pair,
      label: dbTier.label,
      isActive: dbTier.is_active,
    }
    setEditingTier(tier)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header isAuthenticated={true} />
        <main className="flex-1 flex items-center justify-center">
          <Spinner />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold">Configuración de Promociones</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reglas de Descuento por Cantidad</CardTitle>
                <Button onClick={handleAddNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Promoción
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Mínimo Pares</TableHead>
                    <TableHead>Máximo Pares</TableHead>
                    <TableHead>Precio por Par</TableHead>
                    <TableHead>Activa</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.map((tier) => (
                    <TableRow key={tier.id || 'new'}>
                      <TableCell>{tier.label}</TableCell>
                      <TableCell>{tier.min_pairs}</TableCell>
                      <TableCell>{tier.max_pairs === 999999 ? '∞' : tier.max_pairs}</TableCell>
                      <TableCell>${tier.price_per_pair.toLocaleString('es-AR')}</TableCell>
                      <TableCell>
                        <Switch checked={tier.is_active} disabled />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(tier)}
                          >
                            Editar
                          </Button>
                          {tier.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(tier.id!)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {editingTier && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{editingTier.id ? 'Editar Promoción' : 'Nueva Promoción'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSave(editingTier)
                  }}
                  className="space-y-4"
                >
                  <Field>
                    <FieldLabel>Label</FieldLabel>
                    <Input
                      value={editingTier.label}
                      onChange={(e) => setEditingTier({ ...editingTier, label: e.target.value })}
                      placeholder="Ej: Pack 3-5 pares"
                    />
                  </Field>

                  <FieldGroup>
                    <Field>
                      <FieldLabel>Mínimo de Pares</FieldLabel>
                      <Input
                        type="number"
                        value={editingTier.minPairs}
                        onChange={(e) => setEditingTier({ ...editingTier, minPairs: parseInt(e.target.value) || 0 })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Máximo de Pares</FieldLabel>
                      <Input
                        type="number"
                        value={editingTier.maxPairs === 999999 ? '' : editingTier.maxPairs}
                        onChange={(e) => setEditingTier({ ...editingTier, maxPairs: e.target.value ? parseInt(e.target.value) : 999999 })}
                        placeholder="Dejar vacío para sin límite"
                      />
                    </Field>
                  </FieldGroup>

                  <Field>
                    <FieldLabel>Precio por Par ($)</FieldLabel>
                    <Input
                      type="number"
                      value={editingTier.pricePerPair}
                      onChange={(e) => setEditingTier({ ...editingTier, pricePerPair: parseFloat(e.target.value) || 0 })}
                      placeholder="0 para usar precio original"
                    />
                  </Field>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTier.isActive !== false}
                      onCheckedChange={(checked) => setEditingTier({ ...editingTier, isActive: checked })}
                    />
                    <span>Activar promoción</span>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingTier(null)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2">
                      {saving && <Spinner className="h-4 w-4" />}
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
