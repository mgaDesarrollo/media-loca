import { createClient } from '@/lib/supabase/server'
import { CategoriesManager } from './categories-manager'
import type { Category } from '@/lib/types'

export default async function CategoriasPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Categorías</h1>
        <p className="text-muted-foreground">
          Administra las categorías de productos
        </p>
      </div>

      <CategoriesManager initialCategories={(categories as Category[]) || []} />
    </div>
  )
}
