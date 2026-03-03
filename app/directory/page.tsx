import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { DirectoryGrid } from "@/components/directory-grid"

async function DirectoryContent() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Get all residences with user count and user details (including phone numbers)
  const { data: residences } = await supabase
    .from("residences")
    .select(`
      *,
      users(id, email, phone_number)
    `)
    .order("street_name", { ascending: true })
    .order("address", { ascending: true })

  // Add computed is_claimed property and extract phone_number from users
  const residencesWithStatus = (residences || []).map(residence => ({
    ...residence,
    is_claimed: (residence.users?.length ?? 0) > 0,
    phone_number: residence.users?.[0]?.phone_number || ""
  }))

  return <DirectoryGrid residences={residencesWithStatus} currentUserId={user?.id ?? null} />
}

export default async function DirectoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="directory" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Neighborhood Directory</h1>
          <p className="text-slate-600">Connect with your neighbors across all five streets</p>
        </div>
        <Suspense fallback={<div className="text-center py-8">Loading directory...</div>}>
          <DirectoryContent />
        </Suspense>
      </main>
    </div>
  )
}
