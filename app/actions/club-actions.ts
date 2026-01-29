"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
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

export async function deleteClub(clubId: string) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if user is the club creator or an admin
  const { data: club } = await supabase
    .from("clubs")
    .select("created_by")
    .eq("id", clubId)
    .single()

  if (!club) throw new Error("Club not found")

  // Check if user is admin or club creator
  const { data: userProfile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  const isAdmin = userProfile?.is_admin
  const isCreator = club.created_by === user.id

  if (!isAdmin && !isCreator) {
    throw new Error("Only club creator or admin can delete this club")
  }

  // Delete club using service client to bypass RLS (this will cascade to delete club_members, club_posts, etc.)
  const serviceClient = await createServiceClient()
  const { error } = await serviceClient
    .from("clubs")
    .delete()
    .eq("id", clubId)

  if (error) throw error

  revalidatePath("/clubs")
  revalidatePath("/admin")
}
