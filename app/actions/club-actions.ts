"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createClub(name: string, description: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("clubs").insert({ name, description })

  if (error) throw error

  revalidatePath("/clubs")
}

export async function joinClub(clubId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("club_members").insert({ club_id: clubId })

  if (error) throw error

  revalidatePath(`/clubs/${clubId}`)
  revalidatePath("/clubs")
}

export async function leaveClub(clubId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("club_members").delete().eq("club_id", clubId)

  if (error) throw error

  revalidatePath(`/clubs/${clubId}`)
  revalidatePath("/clubs")
}

export async function createClubPost(clubId: string, title: string, description: string, postType: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("club_posts")
    .insert({ club_id: clubId, title, description, post_type: postType })

  if (error) throw error

  revalidatePath(`/clubs/${clubId}`)
}

export async function addClubPostComment(postId: string, content: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("club_post_comments").insert({ post_id: postId, content })

  if (error) throw error

  revalidatePath("/clubs")
}
