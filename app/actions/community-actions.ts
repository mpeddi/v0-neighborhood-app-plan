"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { validateDescription, validateEventTitle } from "@/lib/validation"

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error(`Auth error: ${error?.message || "Not authenticated"}`)
  }
  
  // Ensure user exists in users table (in case auth trigger failed)
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)

  if (!existingUser || existingUser.length === 0) {
    // User doesn't exist, create it with RLS bypass using service client if available
    // Otherwise create with regular client which requires RLS policy to allow it
    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email,
        phone_number: "",
        is_admin: false,
      })
      .select()
    
    if (insertError) {
      console.error("[v0] Failed to create user record:", insertError)
      // Don't throw - just log and continue. RLS policy for users_insert_authenticated should allow this
      // If it fails, the constraint violation will be caught when trying to insert a comment
    }
  }
  
  return { user, supabase }
}

export async function createCharitableItem(title: string, description: string, itemType: string) {
  try {
    const titleValidation = validateEventTitle(title)
    if (!titleValidation.valid) return { success: false, error: titleValidation.error || "Invalid item title" }

    const descriptionValidation = validateDescription(description)
    if (!descriptionValidation.valid) return { success: false, error: descriptionValidation.error || "Invalid description" }

    const { user, supabase } = await getAuthenticatedUser()

    const { error } = await supabase
      .from("charitable_items")
      .insert({ title: title.trim(), description: description.trim(), item_type: itemType, created_by: user.id })

    if (error) return { success: false, error: error.message }
    
    revalidatePath("/community")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] createCharitableItem error:", err)
    return { success: false, error: err.message || "Failed to create item" }
  }
}

export async function createGiveaway(title: string, description: string) {
  try {
    const titleValidation = validateEventTitle(title)
    if (!titleValidation.valid) return { success: false, error: titleValidation.error || "Invalid giveaway title" }

    const descriptionValidation = validateDescription(description)
    if (!descriptionValidation.valid) return { success: false, error: descriptionValidation.error || "Invalid description" }

    const { user, supabase } = await getAuthenticatedUser()

    const { error } = await supabase.from("giveaways").insert({ 
      title: title.trim(), 
      description: description.trim(), 
      created_by: user.id 
    })

    if (error) return { success: false, error: error.message }

    revalidatePath("/community")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] createGiveaway error:", err)
    return { success: false, error: err.message || "Failed to create giveaway" }
  }
}

export async function claimGiveaway(giveawayId: string) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    const { error } = await supabase
      .from("giveaways")
      .update({ status: "claimed", claimed_by: user.id })
      .eq("id", giveawayId)

    if (error) return { success: false, error: error.message }

    revalidatePath("/community")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] claimGiveaway error:", err)
    return { success: false, error: err.message || "Failed to claim giveaway" }
  }
}

export async function createHelpRequest(title: string, description: string, requestType: string) {
  try {
    const titleValidation = validateEventTitle(title)
    if (!titleValidation.valid) return { success: false, error: titleValidation.error || "Invalid request title" }

    const descriptionValidation = validateDescription(description)
    if (!descriptionValidation.valid) return { success: false, error: descriptionValidation.error || "Invalid description" }

    const { user, supabase } = await getAuthenticatedUser()

    const { error } = await supabase
      .from("help_requests")
      .insert({ title: title.trim(), description: description.trim(), request_type: requestType, created_by: user.id })

    if (error) return { success: false, error: error.message }

    revalidatePath("/community")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] createHelpRequest error:", err)
    return { success: false, error: err.message || "Failed to create help request" }
  }
}

export async function addCommunityComment(itemId: string, itemType: string, content: string) {
  try {
    const validation = validateDescription(content)
    if (!validation.valid) return { success: false, error: validation.error || "Invalid comment" }

    const { user, supabase } = await getAuthenticatedUser()

    const { error } = await supabase
      .from("community_comments")
      .insert({ item_id: itemId, item_type: itemType, user_id: user.id, content: content.trim() })

    if (error) return { success: false, error: error.message }

    revalidatePath("/community")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] addCommunityComment error:", err)
    return { success: false, error: err.message || "Failed to add comment" }
  }
}

export async function deleteCharitableItem(itemId: string) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    const { data: item } = await supabase
      .from("charitable_items")
      .select("created_by")
      .eq("id", itemId)
      .single()

    if (!item) return { success: false, error: "Item not found" }

    const { data: userProfile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!userProfile?.is_admin && item.created_by !== user.id) {
      return { success: false, error: "Only admins or item creator can delete this" }
    }

    const serviceClient = await createServiceClient()
    const { error } = await serviceClient
      .from("charitable_items")
      .delete()
      .eq("id", itemId)

    if (error) return { success: false, error: error.message }
    
    revalidatePath("/community")
    revalidatePath("/admin")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] deleteCharitableItem error:", err)
    return { success: false, error: err.message || "Failed to delete item" }
  }
}

export async function deleteGiveaway(giveawayId: string) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    const { data: giveaway } = await supabase
      .from("giveaways")
      .select("created_by")
      .eq("id", giveawayId)
      .single()

    if (!giveaway) return { success: false, error: "Giveaway not found" }

    const { data: userProfile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!userProfile?.is_admin && giveaway.created_by !== user.id) {
      return { success: false, error: "Only admins or giveaway creator can delete this" }
    }

    const serviceClient = await createServiceClient()
    const { error } = await serviceClient
      .from("giveaways")
      .delete()
      .eq("id", giveawayId)

    if (error) return { success: false, error: error.message }
    
    revalidatePath("/community")
    revalidatePath("/admin")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] deleteGiveaway error:", err)
    return { success: false, error: err.message || "Failed to delete giveaway" }
  }
}

export async function deleteHelpRequest(helpRequestId: string) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    const { data: helpRequest } = await supabase
      .from("help_requests")
      .select("created_by")
      .eq("id", helpRequestId)
      .single()

    if (!helpRequest) return { success: false, error: "Help request not found" }

    const { data: userProfile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!userProfile?.is_admin && helpRequest.created_by !== user.id) {
      return { success: false, error: "Only admins or request creator can delete this" }
    }

    const serviceClient = await createServiceClient()
    const { error } = await serviceClient
      .from("help_requests")
      .delete()
      .eq("id", helpRequestId)

    if (error) return { success: false, error: error.message }
    
    revalidatePath("/community")
    revalidatePath("/admin")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] deleteHelpRequest error:", err)
    return { success: false, error: err.message || "Failed to delete help request" }
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/community")
    return { success: true }
  } catch (err: any) {
    console.error("[v0] deleteComment error:", err)
    return { success: false, error: err.message || "Failed to delete comment" }
  }
}
