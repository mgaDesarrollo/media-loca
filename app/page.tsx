import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { auth } from '@/auth'
import { getActiveCategories, getProductsWithCategories } from '@/lib/db/queries'
import { Sparkles, ShieldCheck, Truck } from 'lucide-react'
import { CatalogGrid } from '@/app/catalogo/catalog-grid'

export default async function HomePage() {
  const session = await auth()
  const products = await getProductsWithCategories(true)
  const categories = await getActiveCategories()

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

        <section className="border-y border-border/40 bg-muted/30 px-4 py-12">
          <div className="container mx-auto">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center text-center group transition-all duration-300 hover:scale-105">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary transition-transform duration-500 group-hover:rotate-12" />
                </div>
                <h3 className="mb-2 text-sm font-bold">+50 Diseños Exclusivos</h3>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  Cada par cuenta una historia. Medias únicas que expresan tu personalidad con más de 50 modelos exclusivos.
                </p>
              </div>
              <div className="flex flex-col items-center text-center group transition-all duration-300 hover:scale-105">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <ShieldCheck className="h-5 w-5 text-primary transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="mb-2 text-sm font-bold">100% Algodón Premium</h3>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  Materiales peinados extremadamente suaves y duraderos para asegurar el máximo confort durante todo el día.
                </p>
              </div>
              <div className="flex flex-col items-center text-center group transition-all duration-300 hover:scale-105">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <Truck className="h-5 w-5 text-primary transition-transform duration-500 group-hover:translate-x-1" />
                </div>
                <h3 className="mb-2 text-sm font-bold">Envío en 24-48hs</h3>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  Entrega súper rápida a todo el país. Recibe tus medias favoritas en la puerta de tu casa en tiempo récord.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
