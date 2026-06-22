import { NextResponse } from 'next/server'
import { getSalesByDayOfWeek } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getSalesByDayOfWeek()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sales by day of week:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
