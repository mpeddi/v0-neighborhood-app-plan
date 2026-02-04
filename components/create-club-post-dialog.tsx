"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClubPost } from "@/app/actions/club-actions"
import { Plus } from "lucide-react"

interface CreateClubPostDialogProps {
  clubId: string
}

export function CreateClubPostDialog({ clubId }: CreateClubPostDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    postType: "discussion",
  })

  const postTypes = [
    { value: "discussion", label: "Discussion" },
    { value: "announcement", label: "Announcement" },
    { value: "question", label: "Question" },
    { value: "resource", label: "Resource" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createClubPost(clubId, formData.title, formData.description, formData.postType)
      setFormData({ title: "", description: "", postType: "discussion" })
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Club Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or resources with club members
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postType">Post Type</Label>
            <Select
              value={formData.postType}
              onValueChange={(value) =>
                setFormData({ ...formData, postType: value })
              }
            >
              <SelectTrigger id="postType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Message</Label>
            <Textarea
              id="description"
              placeholder="What would you like to share with the club..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              maxLength={5000}
              rows={5}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
