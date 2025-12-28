import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FieldNav from '@/components/field/FieldNav'
import FieldHeader from '@/components/field/FieldHeader'

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

  // In production, verify user has technician role
  // const { data: profile } = await supabase
  //   .from('lwp_users')
  //   .select('role')
  //   .eq('supabase_id', user.id)
  //   .single()
  //
  // if (!profile || !['technician', 'admin', 'owner'].includes(profile.role)) {
  //   redirect('/portal')
  // }

  return (
    <div className="min-h-screen bg-black">
      <FieldHeader user={user} />
      <main className="pb-20 pt-4 px-4">
        {children}
      </main>
      <FieldNav />
    </div>
  )
}
