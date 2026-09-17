"use client"

import { useTransition } from "react"
import { moderateCommunityComment } from "@/app/actions/community-actions"

export function AdminDashboard({ stats, comments }: { stats: Record<string, number>; comments: Array<{ id: string; content: string; moderation_status: string; item_type: string; created_at: string; users?: { email?: string } | null }> }) {
  const [isPending, startTransition] = useTransition()
  const pending = comments.filter((comment) => comment.moderation_status === "pending")

  function updateComment(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      await moderateCommunityComment(id, status)
    })
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active users", stats.totalUsers],
          ["Claimed residences", stats.claimedResidences],
          ["Events", stats.totalEvents],
          ["Clubs", stats.totalClubs],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Comment review</h2>
            <p className="text-sm text-muted-foreground">New comments stay hidden until approved.</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-sm">{pending.length} pending</span>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments waiting for review.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((comment) => (
              <article key={comment.id} className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm">{comment.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {comment.users?.email ?? "Unknown user"} · {comment.item_type} · {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" disabled={isPending} onClick={() => updateComment(comment.id, "approved")} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">Approve</button>
                  <button type="button" disabled={isPending} onClick={() => updateComment(comment.id, "rejected")} className="rounded-md border px-3 py-2 text-sm disabled:opacity-50">Reject</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
