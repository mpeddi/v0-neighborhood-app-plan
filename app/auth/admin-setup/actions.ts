'use server'

export async function verifyAdminSetupKey(key: string) {
  const adminKey = process.env.ADMIN_SETUP_KEY
  
  if (!adminKey) {
    console.error('[v0] ADMIN_SETUP_KEY not configured')
    return false
  }
  
  return key === adminKey
}

export async function setAdminPassword(password: string) {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No authenticated user found' }
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[v0] Password set error:', err)
    return { success: false, error: err.message || 'Failed to set password' }
  }
}
