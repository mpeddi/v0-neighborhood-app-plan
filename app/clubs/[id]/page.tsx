import { notFound } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { ClubDetail } from "@/components/club-detail"

async function ClubDetailContent({ id }: { id: string }) {
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

  // Get club members
  const { data: members } = await supabase
    .from("club_members")
    .select("*, users(*, residences(*))")
    .eq("club_id", id)

  // Check if user is a member
  const isMember = members?.some(m => m.user_id === user?.id) ?? false

  // Get club posts
  const { data: posts } = await supabase
    .from("club_posts")
    .select("*, users(*, residences(*)), club_post_comments(*, users(*, residences(*)))")
    .eq("club_id", id)
    .order("created_at", { ascending: false })

  return (
    <ClubDetail
      club={club}
      members={members || []}
      posts={posts || []}
      isMember={isMember}
      userId={user?.id ?? null}
      userResidence={userProfile?.residences ?? null}
    />
  )
}

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="clubs" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Suspense fallback={<div className="text-center py-8">Loading club...</div>}>
          <ClubDetailContent id={id} />
        </Suspense>
      </main>
    </div>
  )
}
