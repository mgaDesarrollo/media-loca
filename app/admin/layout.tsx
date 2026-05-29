import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminSidebar } from './admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userEmail={session.user.email || ''} />
      <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
