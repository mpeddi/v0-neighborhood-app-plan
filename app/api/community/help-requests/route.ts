import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    // Create authenticated supabase client using the request cookies (user's session)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // We don't need to set cookies in a GET request
        },
      },
    })

    const { data: helpRequests, error } = await supabase
      .from("help_requests")
      .select("*,users:created_by(id,residences(last_name)),community_comments(*,users(id,residences(last_name)))")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Help requests error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Help requests fetched:", helpRequests?.length || 0, "items")
    if (helpRequests && helpRequests.length > 0) {
      console.log("[v0] First item comments:", helpRequests[0].community_comments?.length || 0)
    }
    return NextResponse.json(helpRequests || [])
  } catch (error) {
    console.error("[v0] Help requests exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
