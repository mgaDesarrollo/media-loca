import { NextResponse } from 'next/server'
import { getSalesByPeriod } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getSalesByPeriod()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sales by period:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
