"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus } from "lucide-react"
import { createClub } from "@/app/actions/club-actions"

export function CreateClubDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createClub(formData.get("name") as string, formData.get("description") as string)
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Failed to create club:", error)
      alert("Failed to create club")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Club
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Club</DialogTitle>
          <DialogDescription>Start a new neighborhood club</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Club Name</label>
            <Input name="name" required placeholder="Enter club name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input name="description" placeholder="What is this club about?" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Club"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
