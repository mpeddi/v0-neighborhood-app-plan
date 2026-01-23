import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/calendar-view"
import { Navigation } from "@/components/navigation"

export default async function CalendarPage() {
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

  // Get all calendar events
  const { data: events } = await supabase
    .from("calendar_events")
    .select(`
      *,
      created_by_user:users!calendar_events_created_by_fkey(id, residence_id, residences(address, last_name))
    `)
    .order("event_date", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="calendar" isAdmin={isAdmin} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Neighborhood Calendar</h1>
          <p className="text-slate-600">Stay connected with upcoming events in our community</p>
        </div>
        <CalendarView events={events || []} userId={user?.id ?? null} isAdmin={isAdmin} />
      </main>
    </div>
  )
}
