'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react'

const analysisQueries = [
  {
    id: 'top-products',
    title: 'Productos Más Vendidos',
    description: 'Top 10 productos por cantidad vendida',
    icon: Package,
    color: 'bg-blue-500',
    endpoint: '/api/analysis/top-products'
  },
  {
    id: 'sales-period',
    title: 'Ventas por Período',
    description: 'Análisis mensual de ventas y revenue',
    icon: Calendar,
    color: 'bg-green-500',
    endpoint: '/api/analysis/sales-period'
  },
  {
    id: 'sales-category',
    title: 'Ventas por Categoría',
    description: 'Revenue y ventas por categoría de producto',
    icon: BarChart3,
    color: 'bg-purple-500',
    endpoint: '/api/analysis/sales-category'
  },
  {
    id: 'orders-stats',
    title: 'Estadísticas de Pedidos',
    description: 'Estado y valor de pedidos web',
    icon: TrendingUp,
    color: 'bg-orange-500',
    endpoint: '/api/analysis/orders-stats'
  },
  {
    id: 'quantity-distribution',
    title: 'Distribución de Cantidad',
    description: 'Cantidad de items por pedido',
    icon: Package,
    color: 'bg-pink-500',
    endpoint: '/api/analysis/quantity-distribution'
  },
  {
    id: 'product-turnover',
    title: 'Rotación de Productos',
    description: 'Productos con mayor rotación (ventas/stock)',
    icon: RefreshCw,
    color: 'bg-cyan-500',
    endpoint: '/api/analysis/product-turnover'
  },
  {
    id: 'promotion-impact',
    title: 'Impacto de Promociones',
    description: 'Efectividad de promociones por cantidad',
    icon: DollarSign,
    color: 'bg-yellow-500',
    endpoint: '/api/analysis/promotion-impact'
  },
  {
    id: 'recurring-customers',
    title: 'Clientes Recurrentes',
    description: 'Clientes que compraron más de una vez',
    icon: Users,
    color: 'bg-indigo-500',
    endpoint: '/api/analysis/recurring-customers'
  },
  {
    id: 'sales-day-week',
    title: 'Ventas por Día de Semana',
    description: 'Distribución de ventas por día',
    icon: Calendar,
    color: 'bg-red-500',
    endpoint: '/api/analysis/sales-day-week'
  },
  {
    id: 'critical-stock',
    title: 'Stock Crítico',
    description: 'Productos con poco stock y alta demanda',
    icon: AlertTriangle,
    color: 'bg-rose-500',
    endpoint: '/api/analysis/critical-stock'
  }
]

export function AnalysisDashboard() {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const executeQuery = async (query: typeof analysisQueries[0]) => {
    setSelectedQuery(query.id)
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(query.endpoint)
      if (!response.ok) {
        throw new Error('Error al ejecutar consulta')
      }
      const data = await response.json()
      setResults(data)
      toast.success('Consulta ejecutada exitosamente')
    } catch (err) {
      setError('Error al ejecutar la consulta. Por favor intenta nuevamente.')
      toast.error('Error al ejecutar consulta')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const renderResults = () => {
    if (!results) return null

    const query = analysisQueries.find(q => q.id === selectedQuery)
    if (!query) return null

    const data = Array.isArray(results) ? results : []

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay datos disponibles para esta consulta</p>
        </div>
      )
    }

    const columns = Object.keys(data[0] || {})

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{query.title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = [
                columns.join(','),
                ...data.map(row => columns.map(col => {
                  const value = row[col]
                  if (value === null || value === undefined) return ''
                  if (typeof value === 'number') return value
                  return `"${String(value).replace(/"/g, '""')}"`
                }).join(','))
              ].join('\n')
              
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${query.id}-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              URL.revokeObjectURL(url)
              toast.success('Datos exportados a CSV')
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="whitespace-nowrap">
                    {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col} className="whitespace-nowrap">
                      {renderCell(row[col], col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {data.length} registros
        </div>
      </div>
    )
  }

  const renderCell = (value: any, column: string) => {
    if (value === null || value === undefined) return '-'
    
    if (typeof value === 'number') {
      if (column.toLowerCase().includes('price') || 
          column.toLowerCase().includes('revenue') || 
          column.toLowerCase().includes('total') ||
          column.toLowerCase().includes('value') ||
          column.toLowerCase().includes('spent')) {
        return formatPrice(value)
      }
      if (column.toLowerCase().includes('ratio') || 
          column.toLowerCase().includes('percentage')) {
        return `${(value * 100).toFixed(2)}%`
      }
      return value.toLocaleString()
    }
    
    if (typeof value === 'string') {
      if (column.toLowerCase().includes('date') || 
          column.toLowerCase().includes('created_at') ||
          column.toLowerCase().includes('updated_at')) {
        return formatDate(value)
      }
      if (column.toLowerCase().includes('status')) {
        const statusColors: Record<string, string> = {
          'pending': 'bg-yellow-100 text-yellow-800',
          'confirmed': 'bg-green-100 text-green-800',
          'cancelled': 'bg-red-100 text-red-800',
        }
        return (
          <Badge className={statusColors[value.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        )
      }
    }
    
    return String(value)
  }

  return (
    <div className="space-y-6">
      {/* Query Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {analysisQueries.map((query) => {
          const Icon = query.icon
          const isActive = selectedQuery === query.id
          
          return (
            <Button
              key={query.id}
              variant={isActive ? 'default' : 'outline'}
              className={`h-auto p-4 flex flex-col items-start gap-3 text-left ${
                isActive ? '' : 'hover:bg-accent'
              }`}
              onClick={() => executeQuery(query)}
              disabled={loading}
            >
              <div className={`p-2 rounded-lg ${query.color} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{query.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {query.description}
                </div>
              </div>
              {loading && isActive && (
                <Spinner className="h-4 w-4" />
              )}
            </Button>
          )
        })}
      </div>

      {/* Results Display */}
      {selectedQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {loading && <Spinner className="h-5 w-5" />}
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    const query = analysisQueries.find(q => q.id === selectedQuery)
                    if (query) executeQuery(query)
                  }}
                >
                  Reintentar
                </Button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
