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

    const { data: giveaways, error } = await supabase
      .from("giveaways")
      .select(`
        *,
        users!giveaways_created_by_fkey(id, residences(last_name)),
        community_comments(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Giveaways API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(giveaways || [])
  } catch (error) {
    console.error("[v0] Giveaways API exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
