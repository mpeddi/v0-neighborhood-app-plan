"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import Link from "next/link"
import { CreateClubDialog } from "./create-club-dialog"

interface Club {
  id: string
  name: string
  description: string | null
  club_members: { count: number }[]
}

interface ClubsListProps {
  clubs: Club[]
  userClubIds: string[]
  userId: string | null
}

export function ClubsList({ clubs, userClubIds }: ClubsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateClubDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => {
          const memberCount = club.club_members[0]?.count || 0
          const isMember = userClubIds.includes(club.id)

          return (
            <Link key={club.id} href={`/clubs/${club.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{club.name}</CardTitle>
                      {isMember && <Badge className="mt-2 bg-green-100 text-green-800">Member</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">{club.description}</CardDescription>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {clubs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No clubs yet. Create the first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
