import { NextResponse } from 'next/server'
import { getRecurringCustomers } from '@/lib/db/queries'

export async function GET() {
  try {
    const data = await getRecurringCustomers()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching recurring customers:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
