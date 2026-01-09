"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Home, Calendar, Heart, Gift, HelpCircle, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AdminDashboardProps {
  stats: {
    totalResidences: number
    claimedResidences: number
    totalUsers: number
    totalEvents: number
    totalClubs: number
    totalGiveaways: number
    totalHelpRequests: number
  }
  recentEvents: any[]
  residences: any[]
}

export function AdminDashboard({ stats, recentEvents, residences }: AdminDashboardProps) {
  const claimRate = stats.totalResidences > 0 ? (stats.claimedResidences / stats.totalResidences) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Residences</CardTitle>
            <Home className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResidences}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.claimedResidences} claimed ({Math.round(claimRate)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Registered neighbors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calendar Events</CardTitle>
            <Calendar className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-slate-500 mt-1">Total scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
            <Heart className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClubs}</div>
            <p className="text-xs text-slate-500 mt-1">Neighborhood clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Giveaways</CardTitle>
            <Gift className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGiveaways}</div>
            <p className="text-xs text-slate-500 mt-1">Items shared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Help Requests</CardTitle>
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHelpRequests}</div>
            <p className="text-xs text-slate-500 mt-1">Neighbors helping neighbors</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest calendar activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-slate-500">
                      Posted by {event.users?.residences?.last_name || "Unknown"} •{" "}
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge>{event.category}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">No recent events</p>
          )}
        </CardContent>
      </Card>

      {/* Residence Status */}
      <Card>
        <CardHeader>
          <CardTitle>Residence Status</CardTitle>
          <CardDescription>Overview of all homes by street</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Symor Dr", "Brothers Pl", "Fanok Rd", "Hadley Way", "Herms Pl"].map((street) => {
              const streetResidences = residences.filter((r) => r.street_name === street)
              const claimedCount = streetResidences.filter((r) => r.is_claimed).length

              return (
                <div key={street} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{street}</h4>
                    <span className="text-sm text-slate-500">
                      {claimedCount}/{streetResidences.length} claimed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {streetResidences.map((residence) => (
                      <div
                        key={residence.id}
                        className={`p-2 rounded border text-xs ${
                          residence.is_claimed ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="font-medium truncate">{residence.address}</div>
                        <div className="text-slate-600 flex items-center gap-1 mt-1">
                          {residence.is_claimed && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                          <span className="truncate">{residence.last_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Community Health Score</h3>
            <div className="text-4xl font-bold text-green-700">{Math.round(claimRate)}%</div>
            <p className="text-sm text-slate-600 mt-2">of homes are actively participating</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
