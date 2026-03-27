'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Package, MessageCircle, ShoppingCart as ShoppingCartIcon } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

interface HeaderProps {
  isAuthenticated?: boolean
}

export function Header({ isAuthenticated = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">🧦</span>
          </div>
          <Link href="/" className="text-xl font-bold">
            Media Loca
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/catalogo" className="text-sm font-medium hover:text-primary">
            Catálogo
          </Link>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <a
              href="https://wa.me/?text=Hola!%20Quiero%20ver%20el%20cat%C3%A1logo%20de%20Media%20Loca"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="h-4 w-4" />
              <span className="hidden sm:inline">Consultar</span>
            </a>
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Panel Admin
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Admin</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
