import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  // Fetch user role from database
  const { data: dbUser } = await supabase
    .from('lwp_users')
    .select('role, first_name, last_name')
    .eq('supabase_id', user.id)
    .single()

  const role = dbUser?.role || user.user_metadata?.role || 'customer'

  // Redirect owners and admins to /manage, technicians to /field
  if (role === 'owner' || role === 'admin') {
    redirect('/manage')
  }
  if (role === 'technician') {
    redirect('/field')
  }

  const userData = {
    email: user.email || '',
    firstName: dbUser?.first_name || user.user_metadata?.first_name || '',
    lastName: dbUser?.last_name || user.user_metadata?.last_name || '',
    role: role,
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060606] text-white antialiased font-sans">
        <ToastProvider />
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
