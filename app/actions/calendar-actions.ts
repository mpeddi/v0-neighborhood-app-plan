"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: {
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  category: string
}) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("calendar_events").insert({
    title: formData.title,
    description: formData.description || null,
    event_date: formData.event_date,
    event_time: formData.event_time || null,
    location: formData.location || null,
    category: formData.category,
    created_by: user.id,
  })

  if (error) throw error

  revalidatePath("/calendar")
}

export async function updateEvent(
  eventId: string,
  formData: {
    title: string
    description: string
    event_date: string
    event_time: string
    location: string
    category: string
  },
) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: formData.title,
      description: formData.description || null,
      event_date: formData.event_date,
      event_time: formData.event_time || null,
      location: formData.location || null,
      category: formData.category,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)

  if (error) throw error

  revalidatePath("/calendar")
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId)

  if (error) throw error

  revalidatePath("/calendar")
}
