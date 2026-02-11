"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { CreateCharitableDialog } from "@/components/create-charitable-dialog"
import { CommunityCommentDialog } from "@/components/community-comment-dialog"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface CharitableSectionProps {
  items: any[]
  userId: string | null
}

export function CharitableSection({ items }: CharitableSectionProps) {
  const [itemsWithUsers, setItemsWithUsers] = useState<any[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      
      // Fetch user data for each comment
      const itemsWithData = await Promise.all(
        items.map(async (item) => {
          const commentsWithUsers = await Promise.all(
            (item.community_comments || []).map(async (comment: any) => {
              const { data: userData } = await supabase
                .from("users")
                .select("residences(last_name)")
                .eq("id", comment.user_id)
                .single()
              return {
                ...comment,
                users: userData
              }
            })
          )
          return {
            ...item,
            community_comments: commentsWithUsers
          }
        })
      )
      setItemsWithUsers(itemsWithData)
    }

    fetchUserData()
  }, [items])

  const displayItems = itemsWithUsers.length > 0 ? itemsWithUsers : items

  return (
    <div className="space-y-6">
      <CreateCharitableDialog />

      <div className="space-y-4">
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{item.title}</CardTitle>
                    <Badge className="mt-2" variant={item.item_type === "drive" ? "default" : "secondary"}>
                      {item.item_type === "drive" ? "Drive" : "Need"}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Posted by {item.users?.residences?.last_name || "Anonymous"} •{" "}
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">{item.description}</p>

                <div className="pt-2 flex gap-2">
                  <CommunityCommentDialog itemId={item.id} itemType="charitable_item" label="Comment" />
                </div>

                {item.community_comments && item.community_comments.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Comments</h4>
                    {item.community_comments.map((comment: any) => (
                      <div key={comment.id} className="bg-slate-50 rounded p-3">
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {comment.users?.residences?.last_name || "Anonymous"} •{" "}
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
              <p className="text-slate-500">No charitable items yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
