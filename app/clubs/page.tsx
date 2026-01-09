import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { ClubsList } from "@/components/clubs-list"

export default async function ClubsPage() {
  const supabase = await createClient()

  // Get all clubs with member counts
  const { data: clubs } = await supabase.from("clubs").select(
    `
      *,
      club_members(count)
    `,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="clubs" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Neighborhood Clubs</h1>
          <p className="text-slate-600">Join clubs, share interests, and connect with neighbors</p>
        </div>
        <ClubsList clubs={clubs || []} userClubIds={[]} userId={null} />
      </main>
    </div>
  )
}
