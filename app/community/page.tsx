import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { CommunityTabs } from "@/components/community-tabs"

async function CommunityContent() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Get charitable items
  const { data: charitableItems } = await supabase
    .from("charitable_items")
    .select("*")
    .order("created_at", { ascending: false })

  // Get giveaways
  const { data: giveaways } = await supabase
    .from("giveaways")
    .select("*")
    .order("created_at", { ascending: false })

  // Get help requests
  const { data: helpRequests } = await supabase
    .from("help_requests")
    .select("*")
    .order("created_at", { ascending: false })

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
