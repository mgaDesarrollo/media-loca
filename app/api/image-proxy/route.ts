import { NextRequest, NextResponse } from 'next/server'
import { head } from '@vercel/blob'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Fetch the image from Vercel Blob Storage
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    const blob = await response.blob()
    
    // Return the image with appropriate headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
  }
}
