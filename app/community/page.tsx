import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { CommunityTabs } from "@/components/community-tabs"

export default async function CommunityPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile to check if admin
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, residences(*)")
    .eq("id", user?.id)
    .single()

  const isAdmin = userProfile?.is_admin ?? false

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="community" isAdmin={isAdmin} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Community Board</h1>
          <p className="text-slate-600">Give back, help out, and support your neighbors</p>
        </div>
        <CommunityTabs
          charitableItems={charitableItems || []}
          giveaways={giveaways || []}
          helpRequests={helpRequests || []}
          userId={user?.id ?? null}
        />
      </main>
    </div>
  )
}
