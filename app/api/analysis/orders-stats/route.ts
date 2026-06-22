import { NextResponse } from 'next/server'
import { getOrdersStats } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getOrdersStats()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching orders stats:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
