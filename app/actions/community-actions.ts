"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCharitableItem(title: string, description: string, itemType: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("charitable_items")
    .insert({ title, description, item_type: itemType, created_by: user.id })

  if (error) throw error

  revalidatePath("/community")
}

export async function createGiveaway(title: string, description: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("giveaways").insert({ 
    title, 
    description, 
    created_by: user.id 
  })

  if (error) throw error

  revalidatePath("/community")
}

export async function claimGiveaway(giveawayId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("giveaways")
    .update({ status: "claimed", claimed_by: user.id })
    .eq("id", giveawayId)

  if (error) throw error

  revalidatePath("/community")
}

export async function createHelpRequest(title: string, description: string, requestType: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("help_requests")
    .insert({ title, description, request_type: requestType, created_by: user.id })

  if (error) throw error

  revalidatePath("/community")
}

export async function addCommunityComment(itemId: string, itemType: string, content: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("community_comments")
    .insert({ item_id: itemId, item_type: itemType, user_id: user.id, content })

  if (error) throw error

  revalidatePath("/community")
}

export async function deleteCharitableItem(itemId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if user is admin or item creator
  const { data: item } = await supabase
    .from("charitable_items")
    .select("created_by")
    .eq("id", itemId)
    .single()

  if (!item) throw new Error("Item not found")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin && item.created_by !== user.id) {
    throw new Error("Only admins or item creator can delete this")
  }

  const { error } = await supabase
    .from("charitable_items")
    .delete()
    .eq("id", itemId)

  if (error) throw error

  revalidatePath("/community")
}

export async function deleteGiveaway(giveawayId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if user is admin or giveaway creator
  const { data: giveaway } = await supabase
    .from("giveaways")
    .select("created_by")
    .eq("id", giveawayId)
    .single()

  if (!giveaway) throw new Error("Giveaway not found")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin && giveaway.created_by !== user.id) {
    throw new Error("Only admins or giveaway creator can delete this")
  }

  const { error } = await supabase
    .from("giveaways")
    .delete()
    .eq("id", giveawayId)

  if (error) throw error

  revalidatePath("/community")
}

export async function deleteHelpRequest(requestId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if user is admin or request creator
  const { data: helpRequest } = await supabase
    .from("help_requests")
    .select("created_by")
    .eq("id", requestId)
    .single()

  if (!helpRequest) throw new Error("Help request not found")

  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!userProfile?.is_admin && helpRequest.created_by !== user.id) {
    throw new Error("Only admins or request creator can delete this")
  }

  const { error } = await supabase
    .from("help_requests")
    .delete()
    .eq("id", requestId)

  if (error) throw error

  revalidatePath("/community")
}
