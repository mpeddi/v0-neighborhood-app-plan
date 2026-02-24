"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function claimResidence(residenceId: string, details: { email?: string; notes?: string }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized - please log in again" }
    }

    // Check if residence is already claimed by another user
    const { data: claimedByOther } = await supabase
      .from("users")
      .select("id")
      .eq("residence_id", residenceId)
      .neq("id", user.id)
      .single()

    if (claimedByOther) {
      return { success: false, error: "This residence has already been claimed by another user" }
    }

    // Update residence with additional details
    const additionalDetails: any = {}
    if (details.email) additionalDetails.email = details.email
    if (details.notes) additionalDetails.notes = details.notes

    const { error: updateError } = await supabase
      .from("residences")
      .update({
        additional_details: additionalDetails,
      })
      .eq("id", residenceId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Link user to residence
    const { error: userError } = await supabase
      .from("users")
      .update({ residence_id: residenceId })
      .eq("id", user.id)

    if (userError) {
      return { success: false, error: userError.message }
    }

    revalidatePath("/directory")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: `Server error: ${err.message}` }
  }
}
