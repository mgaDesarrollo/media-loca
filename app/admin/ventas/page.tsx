import { createClient } from '@/lib/supabase/server'
import { SalesManager } from './sales-manager'
import type { Product, Sale } from '@/lib/types'

export default async function VentasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sales } = await supabase
    .from('sales')
    .select('*, sale_items(*, products(*))')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Ventas</h1>
        <p className="text-muted-foreground">
          Registra y administra tus ventas
        </p>
      </div>

      <SalesManager 
        initialSales={(sales as Sale[]) || []} 
        products={(products as Product[]) || []}
        userId={user!.id}
      />
    </div>
  )
}
