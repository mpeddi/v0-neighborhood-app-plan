import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { ProfileSettings } from "@/components/profile-settings"

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, residences(*)")
    .eq("id", user.id)
    .single()

  // Get all residences for selection
  const { data: allResidences } = await supabase
    .from("residences")
    .select("*")
    .order("street_name")
    .order("address")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation isAdmin={userProfile?.is_admin || false} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>
        <ProfileSettings 
          user={user}
          userProfile={userProfile}
          residences={allResidences || []}
        />
      </main>
    </div>
  )
}
