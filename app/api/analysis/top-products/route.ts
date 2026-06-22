import { NextResponse } from 'next/server'
import { getTopSellingProducts } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getTopSellingProducts()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching top products:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
