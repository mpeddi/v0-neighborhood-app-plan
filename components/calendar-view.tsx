"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Trash2 } from "lucide-react"
import { deleteEvent } from "@/app/actions/calendar-actions"
import { AddEventDialog } from "./add-event-dialog"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns"

interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  category: string
  created_by: string | null
  created_by_user: {
    residences: {
      address: string
      last_name: string
    }
  } | null
}

interface CalendarViewProps {
  events: Event[]
  userId: string | null
  isAdmin: boolean
}

const categoryColors: Record<string, string> = {
  Social: "bg-blue-100 text-blue-800",
  Maintenance: "bg-orange-100 text-orange-800",
  Emergency: "bg-red-100 text-red-800",
  Meeting: "bg-purple-100 text-purple-800",
}

export function CalendarView({ events, userId, isAdmin }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.event_date), date))
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const handleDelete = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(eventId)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                >
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDate(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all
                      ${isSelected ? "border-green-600 bg-green-50" : "border-slate-200 hover:border-green-300"}
                      ${isTodayDate ? "bg-blue-50 border-blue-400" : ""}
                      ${!isSameMonth(day, currentDate) ? "opacity-40" : ""}
                    `}
                  >
                    <div className="text-sm font-medium">{format(day, "d")}</div>
                    {dayEvents.length > 0 && (
                      <div className="flex justify-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event List */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <AddEventDialog />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Events</CardTitle>
                <CardDescription>
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <Badge className={categoryColors[event.category] || "bg-slate-100 text-slate-800"}>
                                {event.category}
                              </Badge>
                            </div>
                            {(event.created_by === userId || isAdmin) && userId && (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {event.description && <p className="text-sm text-slate-600">{event.description}</p>}

                          <div className="flex flex-col gap-1 text-sm text-slate-500">
                            {event.event_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {event.event_time}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-slate-400">
                            Posted by {event.created_by_user?.residences.last_name || "Anonymous"} (
                            {event.created_by_user?.residences.address || "Unknown address"})
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No events scheduled for this day</p>
              )
            ) : (
              <p className="text-center text-slate-500 py-8">Select a date to view events</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
