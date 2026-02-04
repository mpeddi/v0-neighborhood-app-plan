"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle } from "lucide-react"
import { addCommunityComment } from "@/app/actions/community-actions"

interface CommunityCommentDialogProps {
  itemId: string
  itemType: "help_request" | "giveaway" | "charitable"
  label?: string
}

export function CommunityCommentDialog({ itemId, itemType, label }: CommunityCommentDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError("Please enter a response")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await addCommunityComment(itemId, itemType, content)
      setContent("")
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post response")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          {label || "Respond"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label ? `${label}` : "Add Response"}</DialogTitle>
          <DialogDescription>
            Share your response with the community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Type your response here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            disabled={isLoading}
            className="min-h-24"
          />
          <div className="text-xs text-slate-500">{content.length}/5000</div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? "Posting..." : "Post Response"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
