"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserMinus } from "lucide-react"
import { joinClub, leaveClub } from "@/app/actions/club-actions"
import { formatDistanceToNow } from "date-fns"

interface ClubDetailProps {
  club: { id: string; name: string; description: string | null }
  members: any[]
  posts: any[]
  isMember: boolean
  userId: string | null
  userResidence: any
}

export function ClubDetail({ club, members, posts, isMember, userId, userResidence }: ClubDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    if (!userId) return
    setLoading(true)
    await joinClub(club.id)
    router.refresh()
    setLoading(false)
  }

  const handleLeave = async () => {
    if (!userId) return
    if (confirm("Are you sure you want to leave this club?")) {
      setLoading(true)
      await leaveClub(club.id)
      router.refresh()
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Club Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{club.name}</CardTitle>
              <CardDescription className="text-base">{club.description}</CardDescription>
            </div>
            {userId && (
              <div className="flex items-center gap-2">
                {isMember ? (
                  <>
                    <Button variant="outline" onClick={handleLeave} disabled={loading}>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Leave
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleJoin} disabled={loading}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Club
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {isMember ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Club Posts</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      {post.post_type && (
                        <Badge className="mt-2" variant="secondary">
                          {post.post_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Posted by {post.users.residences.last_name} ({post.users.residences.address}) •{" "}
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">{post.description}</p>

                  {/* Comments */}
                  {post.club_post_comments.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-sm text-slate-600">Comments</h4>
                      {post.club_post_comments.map((comment: any) => (
                        <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-sm text-slate-700">{comment.content}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {comment.users.residences.last_name} •{" "}
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No posts yet. Be the first to post!</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">Join the club to see and create posts</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
