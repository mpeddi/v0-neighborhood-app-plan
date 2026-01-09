"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, Phone, MapPin, Search, CheckCircle2 } from "lucide-react"

interface Residence {
  id: string
  address: string
  street_name: string
  last_name: string
  phone_number: string
  is_claimed: boolean
  additional_details: any
  users: { id: string; email: string | null }[]
}

interface DirectoryGridProps {
  residences: Residence[]
  currentUserId: string | null
}

export function DirectoryGrid({ residences, currentUserId }: DirectoryGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [streetFilter, setStreetFilter] = useState("all")

  const streets = Array.from(new Set(residences.map((r) => r.street_name))).sort()

  const filteredResidences = residences.filter((residence) => {
    const matchesSearch =
      residence.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residence.last_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStreet = streetFilter === "all" || residence.street_name === streetFilter

    return matchesSearch && matchesStreet
  })

  const groupedByStreet = filteredResidences.reduce(
    (acc, residence) => {
      if (!acc[residence.street_name]) {
        acc[residence.street_name] = []
      }
      acc[residence.street_name].push(residence)
      return acc
    },
    {} as Record<string, Residence[]>,
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by address or last name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={streetFilter} onValueChange={setStreetFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by street" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streets</SelectItem>
                {streets.map((street) => (
                  <SelectItem key={street} value={street}>
                    {street}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Claimed ({residences.filter((r) => r.is_claimed).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span>Unclaimed ({residences.filter((r) => !r.is_claimed).length})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directory Grid by Street */}
      {Object.entries(groupedByStreet).map(([street, streetResidences]) => (
        <div key={street}>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-600" />
            {street}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streetResidences.map((residence) => {
              const isCurrentUser = currentUserId && residence.users.some((u) => u.id === currentUserId)

              return (
                <Card
                  key={residence.id}
                  className={`relative ${residence.is_claimed ? "border-green-200" : "border-slate-200"} ${isCurrentUser ? "ring-2 ring-blue-400" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Home className="w-5 h-5 text-green-600" />
                          {residence.address}
                        </CardTitle>
                        {residence.is_claimed && (
                          <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Claimed
                          </Badge>
                        )}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
                            Your Home
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Resident</p>
                      <p className="font-semibold text-slate-900">{residence.last_name} Family</p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${residence.phone_number}`} className="hover:text-green-600 transition-colors">
                        {residence.phone_number}
                      </a>
                    </div>

                    {residence.additional_details?.email && (
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <a
                          href={`mailto:${residence.additional_details.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {residence.additional_details.email}
                        </a>
                      </div>
                    )}

                    {residence.additional_details?.notes && (
                      <div>
                        <p className="text-sm text-slate-500">Notes</p>
                        <p className="text-sm text-slate-700">{residence.additional_details.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {filteredResidences.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No residences found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
