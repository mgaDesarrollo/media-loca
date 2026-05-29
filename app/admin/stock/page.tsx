import { getProductsWithCategories } from '@/lib/db/queries'
import { StockManager } from './stock-manager'

export default async function StockPage() {
  const products = await getProductsWithCategories()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Gestión de Stock</h1>
        <p className="text-muted-foreground">Monitorea y ajusta los niveles de inventario</p>
      </div>

      <StockManager products={products} />
    </div>
  )
}
