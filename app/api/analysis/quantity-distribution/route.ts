import { NextResponse } from 'next/server'
import { getOrderQuantityDistribution } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getOrderQuantityDistribution()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching quantity distribution:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
