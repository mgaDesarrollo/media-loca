import { NextResponse } from 'next/server'
import { getPromotionImpact } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getPromotionImpact()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching promotion impact:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
