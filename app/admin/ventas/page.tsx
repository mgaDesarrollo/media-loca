import { auth } from '@/auth'
import { getActiveProducts, getSalesByUser } from '@/lib/db/queries'
import { SalesManager } from './sales-manager'

export default async function VentasPage() {
  const session = await auth()
  const userId = session!.user!.id
  const sales = await getSalesByUser(userId)
  const products = await getActiveProducts()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Ventas</h1>
        <p className="text-muted-foreground">Registra y administra tus ventas</p>
      </div>

      <SalesManager initialSales={sales} products={products} />
    </div>
  )
}
