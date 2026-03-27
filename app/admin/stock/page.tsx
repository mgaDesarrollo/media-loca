import { createClient } from '@/lib/supabase/server'
import { StockManager } from './stock-manager'
import type { Product, Category } from '@/lib/types'

export default async function StockPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .order('name')

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Gestión de Stock</h1>
        <p className="text-muted-foreground">
          Monitorea y ajusta los niveles de inventario
        </p>
      </div>

      <StockManager products={(products as Product[]) || []} />
    </div>
  )
}
