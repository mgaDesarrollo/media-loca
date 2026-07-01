import type { Metadata, Viewport } from 'next'
import { Outfit, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import './globals.css'

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: 'Media Loca - Medias con Personalidad',
  description: 'Descubre nuestra coleccion de medias unicas y divertidas. Calidad, estilo y comodidad en cada par.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Media Loca',
  },
  icons: {
    icon: [
      {
        url: '/api/app-icon?size=32',
      },
    ],
    apple: '/api/app-icon?size=180',
  },
}

export const viewport: Viewport = {
  themeColor: '#F8B4D9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Simply+Olive&display=swap" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
