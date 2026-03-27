'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import type { CashRegisterEntry } from '@/lib/types'

interface CashManagerProps {
  initialEntries: CashRegisterEntry[]
  userId: string
}

export function CashManager({ initialEntries, userId }: CashManagerProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense' | 'adjustment',
    amount: '',
    description: '',
  })
  const router = useRouter()
  const supabase = createClient()

  const balance = entries.reduce((acc, entry) => {
    if (entry.type === 'income' || entry.type === 'sale') {
      return acc + Number(entry.amount)
    } else if (entry.type === 'expense') {
      return acc - Math.abs(Number(entry.amount))
    } else {
      return acc + Number(entry.amount) // adjustment can be positive or negative
    }
  }, 0)

  const totalIncome = entries
    .filter((e) => e.type === 'income' || e.type === 'sale')
    .reduce((acc, e) => acc + Number(e.amount), 0)

  const totalExpense = entries
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => acc + Math.abs(Number(e.amount)), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let amount = parseFloat(formData.amount)
    if (formData.type === 'expense') {
      amount = -Math.abs(amount)
    }

    const { error } = await supabase.from('cash_register').insert({
      user_id: userId,
      type: formData.type,
      amount: amount,
      description: formData.description || null,
    })

    if (error) {
      toast.error('Error al registrar movimiento')
      setLoading(false)
      return
    }

    toast.success('Movimiento registrado')
    setLoading(false)
    setIsDialogOpen(false)
    setFormData({ type: 'income', amount: '', description: '' })
    router.refresh()
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      income: { label: 'Ingreso', variant: 'default' },
      expense: { label: 'Gasto', variant: 'destructive' },
      sale: { label: 'Venta', variant: 'default' },
      adjustment: { label: 'Ajuste', variant: 'secondary' },
    }
    return labels[type] || { label: type, variant: 'outline' as const }
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Actual
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {formatPrice(balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ingresos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastos
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatPrice(totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add entry */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimiento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="type">Tipo</FieldLabel>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'income' | 'expense' | 'adjustment') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="expense">Gasto</SelectItem>
                      <SelectItem value="adjustment">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="amount">Monto</FieldLabel>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Descripcion</FieldLabel>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Compra de stock, pago de luz, etc."
                  />
                </Field>
              </FieldGroup>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Spinner className="mr-2" />}
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries list */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const typeInfo = getTypeLabel(entry.type)
                  const isPositive = entry.type === 'income' || entry.type === 'sale' || Number(entry.amount) > 0
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {entry.description || '-'}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}{formatPrice(Number(entry.amount))}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No hay movimientos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
