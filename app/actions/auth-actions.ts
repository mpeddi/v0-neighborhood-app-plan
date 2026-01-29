"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

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

  // Use service client to bypass RLS for updating residences
  const serviceClient = await createServiceClient()
  
  const { error } = await serviceClient
    .from("residences")
    .update({ last_name: lastName.trim() })
    .eq("id", residenceId)

  if (error) throw new Error(error.message || "Failed to update residence")

  revalidatePath("/admin")
  revalidatePath("/directory")
}

export async function claimResidence(residenceId: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Use service client to bypass RLS
  const serviceClient = await createServiceClient()
  
  // Update user's residence
  const { error: userError } = await serviceClient
    .from("users")
    .update({ residence_id: residenceId })
    .eq("id", user.id)

  if (userError) throw new Error(userError.message || "Failed to claim residence")

  // Mark residence as claimed
  const { error: residenceError } = await serviceClient
    .from("residences")
    .update({ is_claimed: true })
    .eq("id", residenceId)

  if (residenceError) throw new Error(residenceError.message || "Failed to update residence status")

  revalidatePath("/profile")
  revalidatePath("/directory")
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
  console.log("[v0] deleteResidence called with ID:", residenceId)
  const supabase = await createClient()
  
  // Get authenticated user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  console.log("[v0] Current user:", user?.id)
  if (!user) throw new Error("Unauthorized")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  console.log("[v0] User profile:", userProfile)
  if (!userProfile?.is_admin) throw new Error("Admin access required")

  // Use service client to bypass RLS for deleting residences
  console.log("[v0] Creating service client...")
  const serviceClient = await createServiceClient()
  console.log("[v0] Service client created, attempting delete...")
  
  const { data, error } = await serviceClient
    .from("residences")
    .delete()
    .eq("id", residenceId)

  console.log("[v0] Delete response - data:", data, "error:", error)
  
  if (error) throw new Error(error.message || "Failed to delete residence")

  console.log("[v0] Delete successful, revalidating paths...")
  revalidatePath("/admin")
  revalidatePath("/directory")
  console.log("[v0] Paths revalidated")
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
