import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'
import { FaHeart, FaTruck, FaStar, FaGem, FaShare } from 'react-icons/fa'
import { CatalogGrid } from '@/app/catalogo/catalog-grid'
import type { Product, Category } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Obtener productos para mostrar directamente
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-6 md:py-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="container mx-auto text-center">
            {/* Logo */}
            <div className="mb-4 flex justify-center">
              <Image 
                src="/logomedialoca.png"  // Vuelve a esta línea
                alt="Media Loca Logo" 
                width={336}
                height={336}
                className="rounded-lg"
              />
            </div>

            <div className="mx-auto max-w-3xl">
              <h1 className="mb-3 text-2xl font-bold tracking-tight md:text-[1.8rem] lg:text-[2.7rem] font-simply-olive">
                Tus pies merecen ser{' '}
                <span className="text-primary">felices</span>
              </h1>
              <p className="mx-auto mb-4 max-w-2xl text-pretty text-sm text-muted-foreground md:text-base">
                Descubre nuestra coleccion de medias unicas, divertidas y super comodas.
                Porque cada paso cuenta, hazlo con estilo.
              </p>
            </div>
          </div>
        </section>

        {/* Catálogo Directo */}
        <section className="px-4 py-8">
          <div className="container mx-auto">
            <CatalogGrid
              products={(products as Product[]) || []}
              categories={(categories as Category[]) || []}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y border-border/40 bg-muted/30 px-4 py-12">
          <div className="container mx-auto">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FaGem className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">Diseños Únicos</h3>
                <p className="text-xs text-muted-foreground">
                  Cada par cuenta una historia. Medias que expresan tu personalidad.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FaHeart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">Calidad Premium</h3>
                <p className="text-xs text-muted-foreground">
                  Materiales suaves y duraderos para el máximo confort todo el día.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FaTruck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">Envíos Rápidos</h3>
                <p className="text-xs text-muted-foreground">
                  Entrega a todo el país. Recibe tus medias en la puerta de tu casa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-6 text-center text-primary-foreground md:p-10">
              <h2 className="mb-3 text-xl font-bold md:text-2xl font-simply-olive">
                Compartilo con tus amigos
              </h2>
              <p className="mb-4 text-sm text-primary-foreground/80">
                Envia nuestro catálogo por WhatsApp y ayudanos a crecer.
                Tus amigos te lo van a agradecer.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                asChild
              >
                <a
                  href="https://wa.me/?text=Mira%20estas%20medias%20increibles%20de%20Media%20Loca!%20%F0%9F%A7%A6%E2%9C%A8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaShare className="h-4 w-4" />
                  Compartir Catálogo
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
