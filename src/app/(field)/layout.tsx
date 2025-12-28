import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FieldNav from '@/components/field/FieldNav'
import FieldHeader from '@/components/field/FieldHeader'
import { ToastProvider } from '@/components/providers'
import '../globals.css'

export default async function FieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/field')
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
  if (dbUser?.role && !['technician', 'admin', 'owner'].includes(role)) {
    redirect('/portal')
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased font-sans">
        <ToastProvider />
        <div className="min-h-screen">
          <FieldHeader user={user} />
          <main className="pb-20 pt-4 px-4">
            {children}
          </main>
          <FieldNav />
        </div>
      </body>
    </html>
  )
}
