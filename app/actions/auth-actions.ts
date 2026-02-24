'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateEmail, validatePassword } from '@/lib/validation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateResidenceName } from '@/lib/validation'
import { logAuditAction } from '@/lib/audit-logger'

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

export async function signUpWithPassword(email: string, password: string) {
  try {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return { success: false, error: 'Invalid email' }
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.error }
    }

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

    // Check if email is in whitelist
    const { data: whitelisted, error: whitelistError } = await supabase
      .from('allowed_emails')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (whitelistError || !whitelisted) {
      // Generic error - don't reveal if email is whitelisted
      return { success: false, error: 'Invalid email' }
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('[v0] Signup error:', error.message)
      // Generic error for security
      return { success: false, error: 'Invalid email' }
    }

    return { success: true, message: 'Sign up successful' }
  } catch (error) {
    console.error('[v0] Signup exception:', error)
    return { success: false, error: 'Invalid email' }
  }
}

export async function signInWithPassword(email: string, password: string) {
  try {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return { success: false, error: 'Invalid email or password' }
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return { success: false, error: 'Invalid email or password' }
    }

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

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      console.error('[v0] Sign in error:', error.message)
      // Generic error - don't reveal if email exists
      return { success: false, error: 'Invalid email or password' }
    }

    return { success: true, message: 'Sign in successful' }
  } catch (error) {
    console.error('[v0] Sign in exception:', error)
    return { success: false, error: 'Invalid email or password' }
  }
}

export async function resetPassword(email: string) {
  try {
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return { success: false, error: 'Invalid email' }
    }

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

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
    })

    if (error) {
      console.error('[v0] Password reset error:', error.message)
    }

    // Always return success to prevent email enumeration
    return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' }
  } catch (error) {
    console.error('[v0] Password reset exception:', error)
    // Still return success to prevent enumeration
    return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

// ============================================================================
// ADMIN FUNCTIONS (unchanged)
// ============================================================================

export async function addAllowedEmail(email: string, residenceId?: string) {
  const supabase = await createClient()
  
  // Get authenticated user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin) throw new Error("Admin access required")

  // Use service client to bypass RLS for inserting allowed emails
  const serviceClient = await createServiceClient()
  
  const { error } = await serviceClient.from("allowed_emails").insert({
    email: email.toLowerCase().trim(),
    residence_id: residenceId || null,
  })

  if (error) throw error

  revalidatePath("/admin")
}

export async function removeAllowedEmail(emailId: string) {
  const supabase = await createClient()
  
  // Get authenticated user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin) throw new Error("Admin access required")

  // Use service client to bypass RLS for deleting allowed emails
  const serviceClient = await createServiceClient()
  
  const { error } = await serviceClient.from("allowed_emails").delete().eq("id", emailId)

  if (error) throw error

  revalidatePath("/admin")
}

export async function bulkAddAllowedEmails(emails: string[]) {
  const supabase = await createClient()
  
  // Get authenticated user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin) throw new Error("Admin access required")

  // Use service client to bypass RLS for inserting allowed emails
  const serviceClient = await createServiceClient()
  
  // Prepare email records
  const emailRecords = emails.map(email => ({
    email: email.toLowerCase().trim(),
  }))

  console.log("[v0] Attempting to insert emails:", emailRecords.length)

  // Insert all emails, ignoring duplicates
  const { data, error } = await serviceClient
    .from("allowed_emails")
    .upsert(emailRecords, { onConflict: "email", ignoreDuplicates: true })
    .select()

  console.log("[v0] Upsert result - data:", data, "error:", error)

  if (error) {
    console.log("[v0] Bulk upload error details:", JSON.stringify(error))
    throw new Error(error.message || "Failed to add emails")
  }

  revalidatePath("/admin")
}

export async function updateResidence(residenceId: string, lastName: string) {
  // Validate input
  const validation = validateResidenceName(lastName)
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid residence name")
  }
  
  const validatedName = lastName.trim()
  
  const supabase = await createClient()
  
  // Get authenticated user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin) throw new Error("Admin access required")

  // Get old value for audit log
  const serviceClient = await createServiceClient()
  const { data: oldResidence } = await serviceClient
    .from("residences")
    .select("last_name")
    .eq("id", residenceId)
    .single()

  // Update residence
  const { error } = await serviceClient
    .from("residences")
    .update({ last_name: validatedName })
    .eq("id", residenceId)

  if (error) throw new Error(error.message || "Failed to update residence")

  // Log the action
  await logAuditAction({
    admin_id: user.id,
    action: "update",
    resource_type: "residence",
    resource_id: residenceId,
    old_values: { last_name: oldResidence?.last_name },
    new_values: { last_name: validatedName },
    description: `Updated residence name from "${oldResidence?.last_name}" to "${validatedName}"`
  })

  revalidatePath("/admin")
  revalidatePath("/directory")
}

export async function claimResidence(residenceId: string) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Check if user is whitelisted for this residence
    const { data: allowedEmail } = await supabase
      .from("allowed_emails")
      .select("*")
      .eq("residence_id", residenceId)
      .eq("email", user.email!)
      .single()

    if (!allowedEmail) {
      return { success: false, error: "You are not authorized to claim this residence. Please check if your email is whitelisted." }
    }

    // Use service client to bypass RLS
    const serviceClient = await createServiceClient()
    
    // Ensure user exists in users table (create if missing)
    const { data: existingUser } = await serviceClient
      .from("users")
      .select("id")
      .eq("id", user.id)
    
    if (!existingUser || existingUser.length === 0) {
      // Create user record if it doesn't exist
      const { error: createError } = await serviceClient
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          phone_number: "",
          is_admin: false,
        })
      
      if (createError) {
        console.error("[v0] Failed to create user:", createError)
        return { success: false, error: "Failed to create user profile" }
      }
    }
    
    // Check if user already has a residence
    const { data: userResidence } = await serviceClient
      .from("users")
      .select("residence_id")
      .eq("id", user.id)
    
    const userRecord = Array.isArray(userResidence) ? userResidence[0] : userResidence
    if (userRecord?.residence_id) {
      return { success: false, error: "You have already claimed a residence. You can only claim one residence per account." }
    }

    // Update user's residence
    const { error: userError } = await serviceClient
      .from("users")
      .update({ residence_id: residenceId })
      .eq("id", user.id)

    if (userError) return { success: false, error: userError.message || "Failed to claim residence" }

    // Log the claim action
    const { error: auditError } = await serviceClient
      .from("audit_logs")
      .insert({
        admin_id: user.id,
        action: "create",
        resource_type: "residence_claim",
        resource_id: residenceId,
        old_values: { residence_id: null },
        new_values: { residence_id: residenceId },
        description: `User claimed residence: ${residenceId}`
      })
    
    if (auditError) {
      console.error("[v0] Audit log error:", auditError)
      // Don't fail the claim if audit logging fails
    }

    return { success: true }
  } catch (err: any) {
    console.error("[v0] claimResidence error:", err)
    return { success: false, error: err.message || "Failed to claim residence" }
  }
}

export async function updateUserPhone(phoneNumber: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Use service client to bypass RLS
  const serviceClient = await createServiceClient()
  
  const { error } = await serviceClient
    .from("users")
    .update({ phone_number: phoneNumber.trim() })
    .eq("id", user.id)

  if (error) throw new Error(error.message || "Failed to update phone number")

  revalidatePath("/profile")
}

export async function deleteResidence(residenceId: string) {
  const supabase = await createClient()
  
  // Get authenticated user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin) throw new Error("Admin access required")

  // Get residence data before deletion for audit log
  const serviceClient = await createServiceClient()
  const { data: residenceToDelete } = await serviceClient
    .from("residences")
    .select("*")
    .eq("id", residenceId)
    .single()

  // Delete the residence
  const { error } = await serviceClient
    .from("residences")
    .delete()
    .eq("id", residenceId)

  if (error) throw new Error(error.message || "Failed to delete residence")

  // Log the action
  await logAuditAction({
    admin_id: user.id,
    action: "delete",
    resource_type: "residence",
    resource_id: residenceId,
    old_values: residenceToDelete,
    new_values: null,
    description: `Deleted residence: ${residenceToDelete?.address || residenceId}`
  })

  revalidatePath("/admin")
  revalidatePath("/directory")
}

export async function addResidence(address: string, streetName: string, lastName: string) {
  const supabase = await createClient()
  
  // Get authenticated user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin) throw new Error("Admin access required")

  if (!address.trim() || !streetName.trim() || !lastName.trim()) {
    throw new Error("All fields are required")
  }

  // Use service client to bypass RLS for adding residences
  const serviceClient = await createServiceClient()
  
  const { error } = await serviceClient
    .from("residences")
    .insert({
      address: address.trim(),
      street_name: streetName,
      last_name: lastName.trim(),
      phone_number: "",
    })

  if (error) throw new Error(error.message || "Failed to add residence")

  revalidatePath("/admin")
  revalidatePath("/directory")
}
