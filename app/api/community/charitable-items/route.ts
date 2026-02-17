import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Access environment variables directly
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] Charitable items API - Env vars:", { url: url ? "set" : "missing", key: key ? "set" : "missing" })

    if (!url || !key) {
      console.error("[v0] Missing Supabase credentials")
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    // Use fetch directly to query Supabase
    const response = await fetch(`${url}/rest/v1/charitable_items?select=*,users!charitable_items_created_by_fkey(id,residences(last_name)),community_comments(*)&order=created_at.desc`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Supabase API error:", response.status, error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: response.status })
    }

    const charitableItems = await response.json()
    console.log("[v0] Charitable items fetched:", charitableItems?.length || 0)
    return NextResponse.json(charitableItems || [])
  } catch (error) {
    console.error("[v0] Charitable items API exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
