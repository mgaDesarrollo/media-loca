import { getCategories } from '@/lib/db/queries'
import { CategoriesManager } from './categories-manager'

export default async function CategoriasPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Categorías</h1>
        <p className="text-muted-foreground">Administra las categorías de productos</p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  )
}
