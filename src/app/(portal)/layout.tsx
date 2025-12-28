import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalNav } from '@/components/portal/PortalNav'
import { PortalHeader } from '@/components/portal/PortalHeader'
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

  const userData = {
    email: user.email || '',
    firstName: user.user_metadata?.first_name || '',
    lastName: user.user_metadata?.last_name || '',
    role: user.user_metadata?.role || 'customer',
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060606] text-white antialiased font-sans">
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
