import { NextResponse } from 'next/server'
import { getSalesByCategory } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getSalesByCategory()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sales by category:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
