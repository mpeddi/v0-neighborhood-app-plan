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

    const { data: charitableItems, error } = await supabase
      .from("charitable_items")
      .select("*,users:created_by(id,residences(last_name))")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Charitable items error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch comments separately since there's no formal FK relationship
    if (charitableItems && charitableItems.length > 0) {
      const itemIds = charitableItems.map((i: any) => i.id)
      const { data: comments } = await supabase
        .from("community_comments")
        .select("*,users(id,residences(last_name))")
        .eq("item_type", "charitable")
        .in("item_id", itemIds)

      // Attach comments to items
      const itemsWithComments = charitableItems.map((item: any) => ({
        ...item,
        community_comments: comments?.filter((c: any) => c.item_id === item.id) || [],
      }))

      console.log("[v0] Charitable items fetched:", itemsWithComments.length, "items with", comments?.length || 0, "comments")
      return NextResponse.json(itemsWithComments)
    }

    console.log("[v0] Charitable items fetched: 0 items")
    return NextResponse.json(charitableItems || [])
  } catch (error) {
    console.error("[v0] Charitable items exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
