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
