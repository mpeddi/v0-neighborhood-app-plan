import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/calendar-view"
import { Navigation } from "@/components/navigation"

export default async function CalendarPage() {
  const supabase = await createClient()

  // Get all calendar events
  const { data: events } = await supabase
    .from("calendar_events")
    .select(
      `
      *,
      created_by_user:users!calendar_events_created_by_fkey(id, residence_id, residences(address, last_name))
    `,
    )
    .order("event_date", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="calendar" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Neighborhood Calendar</h1>
          <p className="text-slate-600">Stay connected with upcoming events in our community</p>
        </div>
        <CalendarView events={events || []} userId={null} isAdmin={false} />
      </main>
    </div>
  )
}
