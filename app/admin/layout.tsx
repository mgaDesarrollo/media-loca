import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from './admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userEmail={user.email || ''} />
      <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
