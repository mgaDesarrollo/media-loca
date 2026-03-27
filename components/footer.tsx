import Link from 'next/link'
import { FaHeart, FaWhatsapp } from 'react-icons/fa'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-bold text-primary-foreground">🧦</span>
            </div>
            <span className="font-semibold">Media Loca</span>
          </div>
          
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Hecho con <FaHeart className="h-4 w-4 fill-primary text-primary" /> en Córdoba, Argentina por Eloy
          </p>
          
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/catalogo" className="transition-colors hover:text-foreground">
              Catalogo
            </Link>
            <Link href="/auth/login" className="transition-colors hover:text-foreground">
              Admin
            </Link>
            <a
              href="https://wa.me/?text=Hola!%20Vi%20tu%20trabajo%20en%20el%20sitio%20de%20Media%20Loca%20y%20quiero%20contactarte%20para%20desarrollar%20mi%20propia%20web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <FaWhatsapp className="h-4 w-4" />
              Contactar Desarrollador Web
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
