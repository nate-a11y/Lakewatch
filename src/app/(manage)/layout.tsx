import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/AdminNav'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ToastProvider } from '@/components/providers'
import '../globals.css'

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/manage')
  }

  // Check if user has admin/owner role
  // In production, fetch from lwp_users table
  const userData = {
    email: user.email || '',
    firstName: user.user_metadata?.first_name || 'Admin',
    lastName: user.user_metadata?.last_name || '',
    role: user.user_metadata?.role || 'admin',
  }

  // For now, allow access - in production, check role
  // if (!['admin', 'owner'].includes(userData.role)) {
  //   redirect('/portal')
  // }

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060606] text-white antialiased font-sans">
        <ToastProvider />
        <div className="min-h-screen flex">
          <AdminNav />
          <div className="flex-1 flex flex-col lg:ml-64">
            <AdminHeader user={userData} />
            <main className="flex-1 p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
