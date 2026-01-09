"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const otpStore: Record<string, { code: string; expires: number }> = {}

export async function verifyResidence(address: string, lastName: string) {
  const supabase = await createClient()

  console.log("[v0] Verifying residence - Address:", address, "Last Name:", lastName)

  const { data: residence, error } = await supabase
    .from("residences")
    .select("*")
    .ilike("address", address.trim())
    .ilike("last_name", lastName.trim())
    .maybeSingle()

  console.log("[v0] Query result - Data:", residence, "Error:", error)

  if (error || !residence) {
    return { success: false, error: "Residence not found. Please check your address and last name." }
  }

  return { success: true, residence }
}

export async function sendMockOTP(phoneNumber: string) {
  // Mock OTP generation - in production this would use Twilio or similar
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // In development, we'll just log it and return success
  console.log(`[v0] Mock SMS sent to ${phoneNumber}: Your verification code is ${otp}`)

  otpStore[phoneNumber] = {
    code: otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  }

  console.log("[v0] OTP stored:", otpStore[phoneNumber])

  return { success: true, otp } // In production, don't return the OTP
}

export async function verifyOTP(phoneNumber: string, code: string) {
  console.log("[v0] Verifying OTP - Phone:", phoneNumber, "Code:", code)
  console.log("[v0] OTP Store:", otpStore)

  const stored = otpStore[phoneNumber]

  if (!stored) {
    console.log("[v0] No OTP found in store")
    return { success: false, error: "No OTP found. Please request a new code." }
  }

  if (Date.now() > stored.expires) {
    console.log("[v0] OTP expired")
    delete otpStore[phoneNumber]
    return { success: false, error: "OTP expired. Please request a new code." }
  }

  if (stored.code !== code) {
    console.log("[v0] OTP mismatch - Expected:", stored.code, "Got:", code)
    return { success: false, error: "Invalid code. Please try again." }
  }

  console.log("[v0] OTP verified successfully")
  // Clean up
  delete otpStore[phoneNumber]

  return { success: true }
}

export async function createUserAccount(residenceId: string, phoneNumber: string, isAdmin = false) {
  const supabase = await createServiceClient()

  console.log("[v0] Creating user account with service role client")

  // Check if user already exists
  const { data: existingUser } = await supabase.from("users").select("*").eq("phone_number", phoneNumber).maybeSingle()

  if (existingUser) {
    console.log("[v0] User already exists, creating session")
    // User already exists, just create session
    const sessionCreated = await createSession(existingUser.id, phoneNumber, existingUser.is_admin)
    console.log("[v0] Session created:", sessionCreated)
    return { success: true, user: existingUser, sessionCreated }
  }

  console.log("[v0] Creating new user in database")

  // Create new user in database
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      phone_number: phoneNumber,
      residence_id: residenceId,
      is_admin: isAdmin,
    })
    .select()
    .single()

  if (userError) {
    console.log("[v0] Error creating user:", userError)
    return { success: false, error: userError.message || "Failed to create account" }
  }

  console.log("[v0] User created successfully:", newUser.id)

  // Update residence as claimed
  await supabase.from("residences").update({ is_claimed: true }).eq("id", residenceId)

  // Create session
  const sessionCreated = await createSession(newUser.id, phoneNumber, isAdmin)
  console.log("[v0] Session created:", sessionCreated)

  return { success: true, user: newUser, sessionCreated }
}

export async function signInExistingUser(phoneNumber: string) {
  const supabase = await createClient()

  // Find user by phone number
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("phone_number", phoneNumber)
    .maybeSingle()

  if (userError || !userData) {
    console.log("[v0] User not found:", userError)
    return { success: false, error: "User not found" }
  }

  // Create session
  const sessionCreated = await createSession(userData.id, phoneNumber, userData.is_admin)
  console.log("[v0] Session created:", sessionCreated)

  return { success: true, userId: userData.id, sessionCreated }
}

async function createSession(userId: string, phoneNumber: string, isAdmin: boolean) {
  try {
    const cookieStore = await cookies()

    console.log("[v0] Setting session cookie for user:", userId)

    // Store session data in cookie
    cookieStore.set(
      "symor_session",
      JSON.stringify({
        userId,
        phoneNumber,
        isAdmin,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      },
    )

    console.log("[v0] Session cookie set successfully")
    return true
  } catch (error) {
    console.error("[v0] Error setting session cookie:", error)
    return false
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("symor_session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      await logout()
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("symor_session")
}
