"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { validateClubName, validateDescription } from "@/lib/validation"
import { logAuditAction } from "@/lib/audit-logger"

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
  // Validate input
  const titleValidation = validateEventTitle(title)
  if (!titleValidation.valid) {
    throw new Error(titleValidation.error || "Invalid post title")
  }

  const descriptionValidation = validateDescription(description)
  if (!descriptionValidation.valid) {
    throw new Error(descriptionValidation.error || "Invalid description")
  }

  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if user is a member of this club
  const { data: membership } = await supabase
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    throw new Error("You must be a member of this club to post")
  }

  const { error } = await supabase
    .from("club_posts")
    .insert({ 
      club_id: clubId, 
      title: title.trim(), 
      description: description.trim(), 
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

  // Get full club data before deletion for audit log
  const serviceClient = await createServiceClient()
  const { data: clubToDelete } = await serviceClient
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single()

  // Delete club using service client to bypass RLS (this will cascade to delete club_members, club_posts, etc.)
  const { error } = await serviceClient
    .from("clubs")
    .delete()
    .eq("id", clubId)

  if (error) throw error

  // Log the action
  await logAuditAction({
    admin_id: user.id,
    action: "delete",
    resource_type: "club",
    resource_id: clubId,
    old_values: clubToDelete,
    new_values: null,
    description: `Deleted club: ${clubToDelete?.name || clubId}`
  })

  revalidatePath("/clubs")
  revalidatePath("/admin")
}
