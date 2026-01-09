"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCharitableItem(title: string, description: string, itemType: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("charitable_items")
    .insert({ title, description, item_type: itemType, created_by: null })

  if (error) throw error

  revalidatePath("/community")
}

export async function createGiveaway(title: string, description: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("giveaways").insert({ title, description, created_by: null })

  if (error) throw error

  revalidatePath("/community")
}

export async function claimGiveaway(giveawayId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("giveaways")
    .update({ status: "claimed", claimed_by: null })
    .eq("id", giveawayId)

  if (error) throw error

  revalidatePath("/community")
}

export async function createHelpRequest(title: string, description: string, requestType: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("help_requests")
    .insert({ title, description, request_type: requestType, created_by: null })

  if (error) throw error

  revalidatePath("/community")
}

export async function addCommunityComment(itemId: string, itemType: string, content: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("community_comments")
    .insert({ item_id: itemId, item_type: itemType, user_id: null, content })

  if (error) throw error

  revalidatePath("/community")
}
