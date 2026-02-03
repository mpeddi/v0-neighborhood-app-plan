"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { validateResidenceName } from "@/lib/validation"
import { logAuditAction } from "@/lib/audit-logger"
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
    userId: user.id,
    action: "UPDATE",
    resourceType: "residence",
    resourceId: residenceId,
    oldValues: { last_name: oldResidence?.last_name },
    newValues: { last_name: validatedName }
  })

  revalidatePath("/admin")
  revalidatePath("/directory")
}

export async function claimResidence(residenceId: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if user is whitelisted for this residence
  const { data: allowedEmail } = await supabase
    .from("allowed_emails")
    .select("*")
    .eq("residence_id", residenceId)
    .eq("email", user.email!)
    .single()

  if (!allowedEmail) {
    throw new Error("You are not authorized to claim this residence. Please check if your email is whitelisted.")
  }

  // Use service client to bypass RLS
  const serviceClient = await createServiceClient()
  
  // Check if user already has a residence
  const { data: existingUser } = await serviceClient
    .from("users")
    .select("residence_id")
    .eq("id", user.id)
    .single()

  if (existingUser?.residence_id) {
    throw new Error("You have already claimed a residence. You can only claim one residence per account.")
  }

  // Update user's residence - now multiple users can have the same residence_id
  const { error: userError } = await serviceClient
    .from("users")
    .update({ residence_id: residenceId })
    .eq("id", user.id)

  if (userError) throw new Error(userError.message || "Failed to claim residence")

  // Log the claim action
  await logAuditAction({
    userId: user.id,
    action: "CLAIM",
    resourceType: "residence",
    resourceId: residenceId,
    oldValues: { residence_id: null },
    newValues: { residence_id: residenceId, email: user.email }
  })

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
    userId: user.id,
    action: "DELETE",
    resourceType: "residence",
    resourceId: residenceId,
    oldValues: residenceToDelete,
    newValues: null
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
