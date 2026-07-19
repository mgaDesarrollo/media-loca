import { getCategories, getTags } from '@/lib/db/queries'
import { CategoriesManager } from './categories-manager'

export default async function CategoriasPage() {
  const categories = await getCategories()
  const tags = await getTags()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Etiquetas y Categorías</h1>
        <p className="text-muted-foreground">Administra las etiquetas y categorías de productos</p>
      </div>

      <CategoriesManager initialCategories={categories} initialTags={tags} />
    </div>
  )
}
