import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const rows = await sql`
      SELECT app_icon FROM profile_config ORDER BY created_at ASC LIMIT 1
    `
    const customIcon = rows[0]?.app_icon

    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size')

    if (customIcon && typeof customIcon === 'string' && customIcon.startsWith('data:')) {
      const parts = customIcon.split(';base64,')
      if (parts.length === 2) {
        const contentType = parts[0].replace('data:', '')
        const base64Data = parts[1]
        const buffer = Buffer.from(base64Data, 'base64')

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, must-revalidate',
          },
        })
      }
    }

    // Fallback: Redireccionar al icono correspondiente por defecto
    const baseUrl = new URL(request.url).origin
    let fallbackPath = '/pwa-icon-512.png'

    if (size === '192') {
      fallbackPath = '/pwa-icon-192.png'
    } else if (size === '180') {
      fallbackPath = '/apple-icon.png'
    } else if (size === '32') {
      fallbackPath = '/icon-light-32x32.png'
    }

    return NextResponse.redirect(new URL(fallbackPath, baseUrl))
  } catch (error) {
    console.error('Error serving app icon:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
