"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Home, Calendar, Heart, Gift, HelpCircle, CheckCircle2, Mail, Trash2, Upload, Plus, Pencil, Save, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { addAllowedEmail, removeAllowedEmail, bulkAddAllowedEmails, updateResidence } from "@/app/actions/auth-actions"
import { deleteClub } from "@/app/actions/club-actions"
import { deleteGiveaway, deleteHelpRequest, deleteCharitableItem } from "@/app/actions/community-actions"
import ResidenceManager from "./residence-manager" // Declare the ResidenceManager variable before using it

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
  allowedEmails: any[]
  clubs: any[]
  giveaways: any[]
  helpRequests: any[]
  charitableItems: any[]
}

export function AdminDashboard({ stats, recentEvents, residences, allowedEmails, clubs, giveaways, helpRequests, charitableItems }: AdminDashboardProps) {
  const router = useRouter()
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

      {/* Residence Management */}
      <ResidenceManager residences={residences} />

      {/* Email Whitelist Management */}
      <WhitelistManager allowedEmails={allowedEmails} residences={residences} />

      {/* Club Management */}
      <ClubManager clubs={clubs} />

      {/* Community Items Management */}
      <GiveawayManager giveaways={giveaways} />
      <HelpRequestManager helpRequests={helpRequests} />
      <CharitableItemManager charitableItems={charitableItems} />

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

function WhitelistManager({ allowedEmails, residences }: { allowedEmails: any[], residences: any[] }) {
  const [newEmail, setNewEmail] = useState("")
  const [selectedResidence, setSelectedResidence] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [bulkEmails, setBulkEmails] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleAddEmail = async () => {
    if (!newEmail.trim()) return
    setIsAdding(true)
    setError("")
    setSuccess("")
    try {
      const residenceId = selectedResidence && selectedResidence !== "none" ? selectedResidence : undefined
      await addAllowedEmail(newEmail, residenceId)
      setNewEmail("")
      setSelectedResidence("")
      setSuccess("Email added successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to add email")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveEmail = async (emailId: string) => {
    try {
      await removeAllowedEmail(emailId)
    } catch (err: any) {
      setError(err.message || "Failed to remove email")
    }
  }

  const handleBulkUpload = async () => {
    if (!bulkEmails.trim()) return
    setIsUploading(true)
    setError("")
    setSuccess("")
    try {
      // Parse emails - support comma, newline, or semicolon separated
      const emails = bulkEmails
        .split(/[,;\n]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e && e.includes("@"))
      
      if (emails.length === 0) {
        setError("No valid emails found")
        setIsUploading(false)
        return
      }

      await bulkAddAllowedEmails(emails)
      setBulkEmails("")
      setSuccess(`Successfully added ${emails.length} email(s)!`)
      setIsUploading(false)
    } catch (err: any) {
      console.log("[v0] Bulk upload error:", err)
      setError(err.message || "Failed to upload emails")
      setIsUploading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setBulkEmails(text)
    }
    reader.readAsText(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Whitelist Management
        </CardTitle>
        <CardDescription>
          Control who can sign up for the neighborhood app. Only whitelisted emails can create accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        {/* Add Single Email */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Single Email
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="neighbor@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="residence">Link to Residence (Optional)</Label>
              <Select value={selectedResidence} onValueChange={setSelectedResidence}>
                <SelectTrigger>
                  <SelectValue placeholder="Select residence..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No residence</SelectItem>
                  {residences.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.address} - {r.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddEmail} disabled={isAdding || !newEmail.trim()}>
                {isAdding ? "Adding..." : "Add Email"}
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Bulk Upload Emails
          </h4>
          <p className="text-sm text-slate-600">
            Upload a file or paste multiple emails (separated by commas, semicolons, or new lines)
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload CSV or TXT file</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bulk-emails">Or paste emails here</Label>
              <textarea
                id="bulk-emails"
                className="w-full h-32 p-3 border rounded-md mt-1 text-sm"
                placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
              />
            </div>
            <Button onClick={handleBulkUpload} disabled={isUploading || !bulkEmails.trim()}>
              {isUploading ? "Uploading..." : "Upload Emails"}
            </Button>
          </div>
        </div>

        {/* Current Whitelist */}
        <div className="space-y-4">
          <h4 className="font-semibold">
            Current Whitelist ({allowedEmails.length} email{allowedEmails.length !== 1 ? "s" : ""})
          </h4>
          {allowedEmails.length > 0 ? (
            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              {allowedEmails.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                  <div>
                    <div className="font-medium">{entry.email}</div>
                    {entry.residences && (
                      <div className="text-sm text-slate-500">
                        Linked to: {entry.residences.address}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmail(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4 border rounded-lg">
              No emails in whitelist yet. Add emails above to allow neighbors to sign up.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ClubManager({ clubs }: { clubs: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm("Are you sure you want to delete this club? This action cannot be undone.")) {
      return
    }

    setDeletingId(clubId)
    setError("")
    setSuccess("")

    try {
      await deleteClub(clubId)
      setSuccess("Club deleted successfully!")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Delete club error:", err)
      setError(err.message || "Failed to delete club")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Club Management
        </CardTitle>
        <CardDescription>
          Manage all clubs and remove inappropriate or inactive clubs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        {clubs.length > 0 ? (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {clubs.map((club) => (
              <div key={club.id} className="flex items-start justify-between p-4 hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{club.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">{club.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Created by: {club.users?.residences?.last_name || "Unknown"} • Created {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClub(club.id)}
                  disabled={deletingId === club.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8 border rounded-lg">
            No clubs to manage. Clubs will appear here once created.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function GiveawayManager({ giveaways }: { giveaways: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleDeleteGiveaway = async (giveawayId: string) => {
    if (!confirm("Are you sure you want to delete this giveaway?")) {
      return
    }

    setDeletingId(giveawayId)
    setError("")
    setSuccess("")

    try {
      await deleteGiveaway(giveawayId)
      setSuccess("Giveaway deleted successfully!")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Delete giveaway error:", err)
      setError(err.message || "Failed to delete giveaway")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Giveaways Management
        </CardTitle>
        <CardDescription>
          Manage community giveaways and remove inappropriate items.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        {giveaways.length > 0 ? (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {giveaways.map((giveaway) => (
              <div key={giveaway.id} className="flex items-start justify-between p-4 hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{giveaway.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{giveaway.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Status: <Badge variant={giveaway.status === "available" ? "default" : "secondary"}>{giveaway.status}</Badge>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGiveaway(giveaway.id)}
                  disabled={deletingId === giveaway.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8 border rounded-lg">
            No giveaways to manage.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function HelpRequestManager({ helpRequests }: { helpRequests: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleDeleteHelpRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this help request?")) {
      return
    }

    setDeletingId(requestId)
    setError("")
    setSuccess("")

    try {
      await deleteHelpRequest(requestId)
      setSuccess("Help request deleted successfully!")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Delete help request error:", err)
      setError(err.message || "Failed to delete help request")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Help Requests Management
        </CardTitle>
        <CardDescription>
          Manage community help requests and resolve issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        {helpRequests.length > 0 ? (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {helpRequests.map((request) => (
              <div key={request.id} className="flex items-start justify-between p-4 hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{request.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{request.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Type: {request.request_type} • Status: <Badge variant={request.status === "open" ? "default" : "secondary"}>{request.status}</Badge>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteHelpRequest(request.id)}
                  disabled={deletingId === request.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8 border rounded-lg">
            No help requests to manage.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CharitableItemManager({ charitableItems }: { charitableItems: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleDeleteCharitableItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this charitable item?")) {
      return
    }

    setDeletingId(itemId)
    setError("")
    setSuccess("")

    try {
      await deleteCharitableItem(itemId)
      setSuccess("Charitable item deleted successfully!")
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Delete charitable item error:", err)
      setError(err.message || "Failed to delete charitable item")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Charitable Items Management
        </CardTitle>
        <CardDescription>
          Manage charitable drives and community needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        {charitableItems.length > 0 ? (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {charitableItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-4 hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Type: {item.item_type} • Status: <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCharitableItem(item.id)}
                  disabled={deletingId === item.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8 border rounded-lg">
            No charitable items to manage.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
