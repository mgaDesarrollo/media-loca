import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, Wallet, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get stats
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { data: salesData } = await supabase
    .from('sales')
    .select('total')
    .eq('user_id', user!.id)

  const totalSales = salesData?.reduce((acc, sale) => acc + Number(sale.total), 0) || 0
  const salesCount = salesData?.length || 0

  const { data: cashData } = await supabase
    .from('cash_register')
    .select('amount, type')
    .eq('user_id', user!.id)

  const cashBalance = cashData?.reduce((acc, entry) => {
    if (entry.type === 'income' || entry.type === 'sale') {
      return acc + Number(entry.amount)
    } else {
      return acc - Math.abs(Number(entry.amount))
    }
  }, 0) || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      title: 'Productos',
      value: productCount || 0,
      description: 'en el catalogo',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Ventas',
      value: salesCount,
      description: 'registradas',
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Total Vendido',
      value: formatCurrency(totalSales),
      description: 'en ventas',
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Saldo en Caja',
      value: formatCurrency(cashBalance),
      description: 'disponible',
      icon: Wallet,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ]

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administracion de Media Loca
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription>{stat.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rapidas</CardTitle>
            <CardDescription>
              Gestiona tu negocio facilmente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a 
              href="/admin/productos" 
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Agregar producto</p>
                <p className="text-sm text-muted-foreground">Suma nuevas medias al catalogo</p>
              </div>
            </a>
            <a 
              href="/admin/ventas" 
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Registrar venta</p>
                <p className="text-sm text-muted-foreground">Agrega una nueva venta</p>
              </div>
            </a>
            <a 
              href="/admin/caja" 
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Ver movimientos</p>
                <p className="text-sm text-muted-foreground">Revisa el registro de caja</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consejos</CardTitle>
            <CardDescription>
              Tips para hacer crecer tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/5 p-4">
              <p className="font-medium text-primary">Comparte el catalogo</p>
              <p className="text-sm text-muted-foreground">
                Usa el boton de WhatsApp en el catalogo para enviarlo a tus clientes y aumentar tus ventas.
              </p>
            </div>
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="font-medium text-accent-foreground">Mantene el stock actualizado</p>
              <p className="text-sm text-muted-foreground">
                Revisa regularmente el stock de tus productos para no perder ventas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
