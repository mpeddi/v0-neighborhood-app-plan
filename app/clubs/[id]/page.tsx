import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { ClubDetail } from "@/components/club-detail"

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile with residence
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, residences(*)")
    .eq("id", user?.id)
    .single()

  // Get club details
  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single()

  if (!club) {
    notFound()
  }

  // Get club members with residence data
  const { data: members, error: membersError } = await supabase
    .from("club_members")
    .select(`
      id,
      user_id,
      joined_at,
      users!club_members_user_id_fkey(id, residences(last_name))
    `)
    .eq("club_id", id)

  if (membersError) {
    console.log("[v0] Members error:", membersError)
  }

  // Check if user is a member
  const isMember = members?.some(m => m.user_id === user?.id) ?? false

  // Get club posts with user and comment data
  const { data: posts, error: postsError } = await supabase
    .from("club_posts")
    .select(`
      id,
      title,
      description,
      post_type,
      created_at,
      user_id,
      users!club_posts_user_id_fkey(id, residences(last_name)),
      club_post_comments(id, content, created_at, user_id, users!club_post_comments_user_id_fkey(residences(last_name)))
    `)
    .eq("club_id", id)
    .order("created_at", { ascending: false })

  if (postsError) {
    console.log("[v0] Posts error:", postsError)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="clubs" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <ClubDetail
          club={club}
          members={members || []}
          posts={posts || []}
          isMember={isMember}
          userId={user?.id ?? null}
          userResidence={userProfile?.residences ?? null}
        />
      </main>
    </div>
  )
}
