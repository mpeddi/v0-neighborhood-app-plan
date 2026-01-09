"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function claimResidence(residenceId: string, details: { email?: string; notes?: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Check if residence is already claimed
  const { data: residence } = await supabase.from("residences").select("is_claimed").eq("id", residenceId).single()

  if (residence?.is_claimed) {
    return { success: false, error: "This residence has already been claimed" }
  }

  // Update residence with additional details and claim it
  const additionalDetails: any = {}
  if (details.email) additionalDetails.email = details.email
  if (details.notes) additionalDetails.notes = details.notes

  const { error: updateError } = await supabase
    .from("residences")
    .update({
      is_claimed: true,
      additional_details: additionalDetails,
    })
    .eq("id", residenceId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Link user to residence
  const { error: userError } = await supabase.from("users").update({ residence_id: residenceId }).eq("id", user.id)

  if (userError) {
    return { success: false, error: userError.message }
  }

  revalidatePath("/directory")
  return { success: true }
}
