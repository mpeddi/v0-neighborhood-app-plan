import { NextResponse } from "next/server"

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    // Build query URL - just fetch charitable items with user info
    const queryParams = new URLSearchParams({
      select: "*,users:created_by(id,residences(last_name))",
      order: "created_at.desc"
    })
    
    const fetchUrl = `${url}/rest/v1/charitable_items?${queryParams.toString()}`

    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Charitable items error:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: response.status })
    }

    const charitableItems = await response.json()
    return NextResponse.json(charitableItems || [])
  } catch (error) {
    console.error("[v0] Charitable items exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
