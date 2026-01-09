import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { DirectoryGrid } from "@/components/directory-grid"

export default async function DirectoryPage() {
  const supabase = await createClient()

  // Get all residences
  const { data: residences } = await supabase
    .from("residences")
    .select(
      `
      *,
      users(id)
    `,
    )
    .order("street_name", { ascending: true })
    .order("address", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="directory" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Neighborhood Directory</h1>
          <p className="text-slate-600">Connect with your neighbors across all five streets</p>
        </div>
        <DirectoryGrid residences={residences || []} currentUserId={null} />
      </main>
    </div>
  )
}
