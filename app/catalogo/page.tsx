import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CatalogGrid } from './catalog-grid'
import type { Product, Category } from '@/lib/types'

export const metadata = {
  title: 'Catalogo - Media Loca',
  description: 'Explora nuestra coleccion completa de medias unicas y divertidas',
}

export default async function CatalogoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={!!user} />
      
      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Nuestro Catalogo</h1>
            <p className="text-muted-foreground">
              Encuentra las medias perfectas para ti o para regalar
            </p>
          </div>
          
          <CatalogGrid 
            products={(products as Product[]) || []} 
            categories={(categories as Category[]) || []} 
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
