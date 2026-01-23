"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createClub(name: string, description: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("clubs").insert({ 
    name, 
    description,
    created_by: user.id 
  })

  if (error) throw error

  revalidatePath("/clubs")
}

export async function joinClub(clubId: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("club_members").insert({ 
    club_id: clubId,
    user_id: user.id 
  })

  if (error) {
    console.error("[v0] Join club error:", error)
    throw new Error("Failed to join club")
  }

  revalidatePath(`/clubs/${clubId}`)
  revalidatePath("/clubs")
}

export async function leaveClub(clubId: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath(`/clubs/${clubId}`)
  revalidatePath("/clubs")
}

export async function createClubPost(clubId: string, title: string, description: string, postType: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("club_posts")
    .insert({ 
      club_id: clubId, 
      title, 
      description, 
      post_type: postType,
      user_id: user.id 
    })

  if (error) throw error

  revalidatePath(`/clubs/${clubId}`)
}

export async function addClubPostComment(postId: string, content: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("club_post_comments").insert({ 
    post_id: postId, 
    content,
    user_id: user.id 
  })

  if (error) throw error

  revalidatePath("/clubs")
}
