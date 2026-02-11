import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { CommunityTabs } from "@/components/community-tabs"

async function CommunityContent() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Get charitable items with user and comment data
  const { data: charitableItems, error: charitableError } = await supabase
    .from("charitable_items")
    .select(`
      *,
      users!charitable_items_created_by_fkey(id, residences(last_name)),
      community_comments(*)
    `)
    .order("created_at", { ascending: false })

  if (charitableError) {
    console.log("[v0] Charitable items error:", charitableError)
  }

  // Get giveaways with user and comment data
  const { data: giveaways, error: giveawaysError } = await supabase
    .from("giveaways")
    .select(`
      *,
      users!giveaways_created_by_fkey(id, residences(last_name)),
      community_comments(*)
    `)
    .order("created_at", { ascending: false })

  if (giveawaysError) {
    console.log("[v0] Giveaways error:", giveawaysError)
  }

  // Get help requests with user and comment data
  const { data: helpRequests, error: helpError } = await supabase
    .from("help_requests")
    .select(`
      *,
      users!help_requests_created_by_fkey(id, residences(last_name)),
      community_comments(*)
    `)
    .order("created_at", { ascending: false })

  if (helpError) {
    console.log("[v0] Help requests error:", helpError)
  }

  return (
    <CommunityTabs
      charitableItems={charitableItems || []}
      giveaways={giveaways || []}
      helpRequests={helpRequests || []}
      userId={user?.id ?? null}
    />
  )
}

export default async function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="community" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Community Board</h1>
          <p className="text-slate-600">Give back, help out, and support your neighbors</p>
        </div>
        <Suspense fallback={<div className="text-center py-8">Loading community board...</div>}>
          <CommunityContent />
        </Suspense>
      </main>
    </div>
  )
}
