import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: helpRequests, error } = await supabase
      .from("help_requests")
      .select(`
        *,
        users!help_requests_created_by_fkey(id, residences(last_name)),
        community_comments(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Help requests API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(helpRequests || [])
  } catch (error) {
    console.error("[v0] Help requests API exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
