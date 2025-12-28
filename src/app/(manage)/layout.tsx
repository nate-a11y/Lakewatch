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

  // Fetch user role from database - try supabase_id first, then email as fallback
  let { data: dbUser } = await supabase
    .from('lwp_users')
    .select('role, first_name, last_name')
    .eq('supabase_id', user.id)
    .single()

  // Fallback to email lookup if supabase_id not found
  if (!dbUser && user.email) {
    const { data: emailUser } = await supabase
      .from('lwp_users')
      .select('role, first_name, last_name')
      .eq('email', user.email)
      .single()
    dbUser = emailUser
  }

  const role = dbUser?.role || user.user_metadata?.role || 'customer'

  // Only redirect away if we have a confirmed role from the database
  // This prevents redirect loops when the database query fails
  if (dbUser?.role && !['admin', 'owner'].includes(role)) {
    if (role === 'technician') {
      redirect('/field')
    }
    redirect('/portal')
  }

  const userData = {
    email: user.email || '',
    firstName: dbUser?.first_name || user.user_metadata?.first_name || 'Admin',
    lastName: dbUser?.last_name || user.user_metadata?.last_name || '',
    role: role,
  }

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
