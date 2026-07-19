import { getCategories, getProductsWithCategories, getTags } from '@/lib/db/queries'
import { ProductsManager } from './products-manager'

export default async function ProductosPage() {
  const products = await getProductsWithCategories()
  const categories = await getCategories()
  const tags = await getTags()

  return (
    <div className="space-y-6 pt-14 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Productos</h1>
        <p className="text-muted-foreground">Administra tu catalogo de productos</p>
      </div>

      <ProductsManager initialProducts={products} categories={categories} tags={tags} />
    </div>
  )
}
