import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { PortalNav } from '@/components/portal/PortalNav'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { ToastProvider } from '@/components/providers'
import '../globals.css'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if viewing as customer (admin preview mode via cookie set by middleware)
  const cookieStore = await cookies()
  const isViewingAsCustomer = cookieStore.get('viewAsCustomer')?.value === 'true'

  // Fetch user role from database using email (most reliable)
  const { data: dbUser } = await supabase
    .from('lwp_users')
    .select('role, first_name, last_name')
    .eq('email', user.email)
    .single()

  const role = dbUser?.role || user.user_metadata?.role || 'customer'

  // Only redirect if we have a confirmed role from the database
  // Skip redirect if admin is viewing portal as customer
  if (dbUser?.role && !isViewingAsCustomer) {
    if (role === 'owner' || role === 'admin') {
      redirect('/manage')
    }
    if (role === 'technician') {
      redirect('/field')
    }
  }

  const userData = {
    email: user.email || '',
    firstName: dbUser?.first_name || user.user_metadata?.first_name || '',
    lastName: dbUser?.last_name || user.user_metadata?.last_name || '',
    role: role,
  }

  // Check if user is actually an admin viewing as customer
  const isAdminPreview = isViewingAsCustomer && ['admin', 'owner'].includes(role)

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060606] text-white antialiased font-sans">
        <ToastProvider />
        {isAdminPreview && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center">
            <span className="text-sm text-yellow-500">
              Viewing as customer •{' '}
              <a href="/manage" className="underline hover:text-yellow-400">
                Return to Admin Dashboard
              </a>
            </span>
          </div>
        )}
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <PortalNav />

          {/* Main content */}
          <div className="flex-1 flex flex-col lg:ml-64">
            <PortalHeader user={userData} />
            <main className="flex-1 p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
