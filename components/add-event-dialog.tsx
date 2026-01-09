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
import { createEvent } from "@/app/actions/calendar-actions"

export function AddEventDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createEvent({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        event_date: formData.get("event_date") as string,
        event_time: formData.get("event_time") as string,
        location: formData.get("location") as string,
        category: formData.get("category") as string,
      })
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Failed to create event:", error)
      alert("Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>Create a new neighborhood event</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input name="title" required placeholder="Event title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input name="description" placeholder="Event description" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input name="event_date" type="date" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <Input name="event_time" type="time" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input name="location" placeholder="Event location" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" className="w-full px-3 py-2 border rounded-md" required>
              <option value="Social">Social</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Emergency">Emergency</option>
              <option value="Meeting">Meeting</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
