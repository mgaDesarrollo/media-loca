import { NextResponse } from 'next/server'
import { deleteOrder } from '@/lib/actions/admin'

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
