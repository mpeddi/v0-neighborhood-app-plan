'use server'

export async function verifyAdminSetupKey(key: string) {
  const adminKey = process.env.ADMIN_SETUP_KEY
  
  if (!adminKey) {
    console.error('[v0] ADMIN_SETUP_KEY not configured')
    return false
  }
  
  return key === adminKey
}

export async function setAdminPassword(password: string, setupKey: string) {
  const { createClient } = await import('@supabase/supabase-js')
  
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }

  // Verify the setup key
  const adminKey = process.env.ADMIN_SETUP_KEY
  if (!adminKey || setupKey !== adminKey) {
    return { success: false, error: 'Invalid setup key' }
  }

  try {
    // We need to get the user's email from somewhere - ideally from the setup context
    // For now, we'll use a service client to update the user that was just created
    // This requires the user to exist in auth already but without a password
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // First, try to get the session from cookies to identify the user
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('sb-access-token')?.value
    
    if (!authCookie) {
      return { success: false, error: 'No session found. Please sign up first.' }
    }

    // Use the authenticated session to update the password
    const { data: { user } } = await supabase.auth.getUser(authCookie)
    if (!user) {
      return { success: false, error: 'Unable to verify user session' }
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, { password })
    if (error) {
      console.error('[v0] Password update error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[v0] Password set error:', err)
    return { success: false, error: err.message || 'Failed to set password' }
  }
}
