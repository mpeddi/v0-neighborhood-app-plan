import { NextResponse } from "next/server"

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] Help requests API called")

    if (!url || !key) {
      console.error("[v0] Missing Supabase credentials")
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    // Build query URL - just fetch help requests with user info
    const queryParams = new URLSearchParams({
      select: "*,users:created_by(id,residences(last_name))",
      order: "created_at.desc"
    })
    
    const fetchUrl = `${url}/rest/v1/help_requests?${queryParams.toString()}`
    console.log("[v0] Fetching from help_requests table")

    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Help requests error:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: response.status })
    }

    const helpRequests = await response.json()
    console.log("[v0] Help requests returned:", helpRequests?.length || 0, "items")
    console.log("[v0] Help requests data:", JSON.stringify(helpRequests).substring(0, 200))
    return NextResponse.json(helpRequests || [])
  } catch (error) {
    console.error("[v0] Help requests exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
