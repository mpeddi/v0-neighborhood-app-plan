'use client'

import { Suspense, useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { CommunityTabs } from "@/components/community-tabs"

function CommunityContent() {
  const [charitableItems, setCharitableItems] = useState([])
  const [giveaways, setGiveaways] = useState([])
  const [helpRequests, setHelpRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCommunityData() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const authRes = await fetch("/api/auth/user")
        if (authRes.ok) {
          const userData = await authRes.json()
          setUserId(userData.id || null)
        }

        // Fetch all community data in parallel
        const [charitableRes, giveawaysRes, helpRes] = await Promise.all([
          fetch("/api/community/charitable-items"),
          fetch("/api/community/giveaways"),
          fetch("/api/community/help-requests"),
        ])

        console.log("[v0] Response statuses:", charitableRes.status, giveawaysRes.status, helpRes.status)

        const [charitable, giveawaysData, helpData] = await Promise.all([
          charitableRes.json(),
          giveawaysRes.json(),
          helpRes.json(),
        ])

        console.log("[v0] Community data:", { charitable, giveawaysData, helpData })

        setCharitableItems(Array.isArray(charitable) ? charitable : [])
        setGiveaways(Array.isArray(giveawaysData) ? giveawaysData : [])
        setHelpRequests(Array.isArray(helpData) ? helpData : [])
      } catch (err) {
        console.error("[v0] Error fetching community data:", err)
        setError("Failed to load community board")
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityData()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading community board...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <CommunityTabs
      charitableItems={charitableItems}
      giveaways={giveaways}
      helpRequests={helpRequests}
      userId={userId}
    />
  )
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation currentPage="community" isAdmin={false} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Community Board</h1>
          <p className="text-slate-600">Give back, help out, and support your neighbors</p>
        </div>
        <Suspense fallback={<div className="text-center py-8">Loading community board...</div>}>
          <CommunityContent />
        </Suspense>
      </main>
    </div>
  )
}
