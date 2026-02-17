import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Access environment variables directly
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] Giveaways API - Env vars:", { url: url ? "set" : "missing", key: key ? "set" : "missing" })

    if (!url || !key) {
      console.error("[v0] Missing Supabase credentials")
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    // Build query URL with proper encoding
    const queryParams = new URLSearchParams({
      select: "*,users!giveaways_created_by_fkey(id,residences(last_name)),community_comments(*)",
      order: "created_at.desc"
    })
    
    const fetchUrl = `${url}/rest/v1/giveaways?${queryParams.toString()}`
    console.log("[v0] Fetching from:", fetchUrl.replace(key, "***"))

    // Use fetch directly to query Supabase
    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Supabase API error:", response.status, error)
      return NextResponse.json({ error: `Failed to fetch data: ${error}` }, { status: response.status })
    }

    const giveaways = await response.json()
    console.log("[v0] Giveaways fetched:", giveaways?.length || 0)
    return NextResponse.json(giveaways || [])
  } catch (error) {
    console.error("[v0] Giveaways API exception:", error)
    return NextResponse.json({ error: `Internal server error: ${String(error)}` }, { status: 500 })
  }
}
