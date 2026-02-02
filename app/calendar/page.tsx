import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/calendar-view"
import { Navigation } from "@/components/navigation"

async function CalendarContent() {
  const supabase = await createClient()

  // Get authenticated user (may be null in preview mode)
  let user = null
  let userProfile = null
  
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
    
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("*, residences(*)")
        .eq("id", user.id)
        .single()
      userProfile = profile
    }
  } catch (err) {
    // Allow preview mode without auth
    console.log("[v0] Running in preview mode without authentication")
  }

  const isAdmin = userProfile?.is_admin ?? false

  // Get all calendar events
  const { data: events } = await supabase
    .from("calendar_events")
    .select(`
      *,
      created_by_user:users!calendar_events_created_by_fkey(id, residence_id, residences(address, last_name))
    `)
    .order("event_date", { ascending: true })

  return <CalendarView events={events || []} userId={user?.id ?? null} isAdmin={isAdmin} />
}

export default async function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="calendar" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Neighborhood Calendar</h1>
          <p className="text-slate-600">Stay connected with upcoming events in our community</p>
        </div>
        <Suspense fallback={<div className="text-center py-8">Loading calendar...</div>}>
          <CalendarContent />
        </Suspense>
      </main>
    </div>
  )
}
