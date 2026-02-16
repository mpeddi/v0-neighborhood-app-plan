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

    const { data: charitableItems, error } = await supabase
      .from("charitable_items")
      .select(`
        *,
        users!charitable_items_created_by_fkey(id, residences(last_name)),
        community_comments(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Charitable items API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(charitableItems || [])
  } catch (error) {
    console.error("[v0] Charitable items API exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
