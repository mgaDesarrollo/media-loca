import { NextResponse } from 'next/server'
import { getCriticalStockProducts } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getCriticalStockProducts()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching critical stock products:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
