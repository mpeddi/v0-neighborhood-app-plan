import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect if not authenticated
  if (!user) {
    redirect("/auth/login")
  }
  
  // Get user profile to check if admin
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, residences(*)")
    .eq("id", user.id)
    .single()

  // Only allow admins to access this page
  if (!userProfile?.is_admin) {
    redirect("/calendar")
  }

  // Get statistics
  const { count: totalResidences } = await supabase
    .from("residences")
    .select("*", { count: "exact", head: true })

  const { count: claimedResidences } = await supabase
    .from("residences")
    .select("*", { count: "exact", head: true })
    .eq("is_claimed", true)

  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })

  const { count: totalEvents } = await supabase
    .from("calendar_events")
    .select("*", { count: "exact", head: true })

  const { count: totalClubs } = await supabase
    .from("clubs")
    .select("*", { count: "exact", head: true })

  const { count: totalGiveaways } = await supabase
    .from("giveaways")
    .select("*", { count: "exact", head: true })

  const { count: totalHelpRequests } = await supabase
    .from("help_requests")
    .select("*", { count: "exact", head: true })

  // Get recent activity
  const { data: recentEvents } = await supabase
    .from("calendar_events")
    .select("*, users(*, residences(*))")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: allResidences } = await supabase
    .from("residences")
    .select("*, users(*)")
    .order("street_name", { ascending: true })

  // Get allowed emails for whitelist management
  const { data: allowedEmails } = await supabase
    .from("allowed_emails")
    .select("*, residences(*)")
    .order("created_at", { ascending: false })

  const stats = {
    totalResidences: totalResidences || 0,
    claimedResidences: claimedResidences || 0,
    totalUsers: totalUsers || 0,
    totalEvents: totalEvents || 0,
    totalClubs: totalClubs || 0,
    totalGiveaways: totalGiveaways || 0,
    totalHelpRequests: totalHelpRequests || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="admin" isAdmin={true} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage The Symor Driver neighborhood app</p>
        </div>
        <AdminDashboard 
          stats={stats} 
          recentEvents={recentEvents || []} 
          residences={allResidences || []}
          allowedEmails={allowedEmails || []}
        />
      </main>
    </div>
  )
}
