import { NextResponse } from 'next/server'
import { getPromotionTiers } from '@/lib/db/queries'

export async function GET() {
  try {
    const promotions = await getPromotionTiers()
    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json([], { status: 500 })
  }
}
