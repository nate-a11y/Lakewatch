import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get current user from session
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch user profile from database
  const { data: userProfile } = authUser
    ? await supabase
        .from('lwp_users')
        .select('id, first_name, last_name, email, phone')
        .eq('auth_user_id', authUser.id)
        .single()
    : { data: null }

  const user = userProfile
    ? {
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || authUser?.email || '',
        phone: userProfile.phone || '',
      }
    : {
        firstName: '',
        lastName: '',
        email: authUser?.email || '',
        phone: '',
      }

  return <SettingsClient initialUser={user} />
}
