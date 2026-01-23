import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { ClubsList } from "@/components/clubs-list"

export default async function ClubsPage() {
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

  // Get clubs the user is a member of
  const { data: userMemberships } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("user_id", user?.id)

  const userClubIds = userMemberships?.map(m => m.club_id) || []

  // Get all clubs with member counts
  const { data: clubs } = await supabase
    .from("clubs")
    .select(`
      *,
      club_members(count)
    `)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="clubs" isAdmin={isAdmin} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Neighborhood Clubs</h1>
          <p className="text-slate-600">Join clubs, share interests, and connect with neighbors</p>
        </div>
        <ClubsList clubs={clubs || []} userClubIds={userClubIds} userId={user?.id ?? null} />
      </main>
    </div>
  )
}
