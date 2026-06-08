import { NextResponse } from 'next/server'
import { deleteOrder } from '@/lib/actions/admin'
import { sql } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteOrder(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    await sql`
      UPDATE orders
      SET
        customer_name = ${body.customer_name || null},
        customer_phone = ${body.customer_phone || null},
        customer_email = ${body.customer_email || null},
        notes = ${body.notes || null},
        updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
