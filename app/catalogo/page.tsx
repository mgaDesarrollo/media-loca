import { auth } from '@/auth'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getActiveCategories, getProductsWithCategories } from '@/lib/db/queries'
import { CatalogGrid } from './catalog-grid'

export const metadata = {
  title: 'Catalogo - Media Loca',
  description: 'Explora nuestra coleccion completa de medias unicas y divertidas',
}

export default async function CatalogoPage() {
  const session = await auth()
  const products = await getProductsWithCategories(true)
  const categories = await getActiveCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={!!session?.user} />

      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Nuestro Catalogo</h1>
            <p className="text-muted-foreground">
              Encuentra las medias perfectas para ti o para regalar
            </p>
          </div>

          <CatalogGrid products={products} categories={categories} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
