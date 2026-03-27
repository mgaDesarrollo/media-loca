import { createClient } from '@/lib/supabase/server'
import { ProductsManager } from './products-manager'
import type { Product, Category } from '@/lib/types'

export default async function ProductosPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Productos</h1>
        <p className="text-muted-foreground">
          Administra tu catalogo de productos
        </p>
      </div>

      <ProductsManager 
        initialProducts={(products as Product[]) || []} 
        categories={(categories as Category[]) || []}
      />
    </div>
  )
}
