import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { auth } from '@/auth'
import { getActiveCategories, getProductsWithCategories, getProfileConfig } from '@/lib/db/queries'
import { Sparkles, ShieldCheck, Truck } from 'lucide-react'
import { CatalogGrid } from '@/app/catalogo/catalog-grid'
import { HomeCarousel } from '@/components/home-carousel'

export default async function HomePage() {
  const session = await auth()
  const products = await getProductsWithCategories(true)
  const categories = await getActiveCategories()
  const profileConfig = await getProfileConfig()

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={!!session?.user} />

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 py-6 md:py-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="container mx-auto text-center">
            <div className="mb-4 flex justify-center">
              <Image
                src="/logomedialoca.png"
                alt="Media Loca Logo"
                width={160}
                height={160}
                className="rounded-lg w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 object-contain"
              />
            </div>

            <div className="mx-auto max-w-3xl">
              <h1 className="mb-3 text-2xl font-bold tracking-tight md:text-[1.8rem] lg:text-[2.7rem] font-simply-olive">
                Tus pies merecen ser{' '}
                <span className="text-primary">felices</span>
              </h1>
              <p className="mx-auto mb-4 max-w-2xl text-pretty text-sm text-muted-foreground md:text-base">
                Descubre nuestra colección de medias únicas, divertidas y super cómodas.
                Porque cada paso cuenta, hazlo con estilo.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-8">
          <div className="container mx-auto">
            <CatalogGrid products={products} categories={categories} />
          </div>
        </section>

        {profileConfig?.carousel_images && profileConfig.carousel_images.length > 0 && (
          <section className="px-4 pb-12">
            <div className="container mx-auto">
              <HomeCarousel images={profileConfig.carousel_images} />
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}
