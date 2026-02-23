'use server'

import { createClient } from '@supabase/supabase-js'

export async function setPasswordWithToken(email: string, password: string, token: string) {
  // Verify the token
  const adminToken = process.env.ADMIN_PASSWORD_SETUP_TOKEN
  if (!adminToken || token !== adminToken) {
    return { success: false, error: 'Invalid or missing setup token' }
  }

  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('[v0] Error listing users:', getUserError)
      return { success: false, error: 'Failed to find user' }
    }

    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateError) {
      console.error('[v0] Error updating password:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, message: 'Password set successfully. You can now log in.' }
  } catch (err: any) {
    console.error('[v0] Setup error:', err)
    return { success: false, error: err.message || 'Failed to set password' }
  }
}
