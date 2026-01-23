"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Home, Phone, Mail, CheckCircle2 } from "lucide-react"
import { claimResidence, updateUserPhone } from "@/app/actions/auth-actions"

interface ProfileSettingsProps {
  user: any
  userProfile: any
  residences: any[]
}

export function ProfileSettings({ user, userProfile, residences }: ProfileSettingsProps) {
  const [selectedResidence, setSelectedResidence] = useState("")
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || "")
  const [isClaimingResidence, setIsClaimingResidence] = useState(false)
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleClaimResidence = async () => {
    if (!selectedResidence) return
    setIsClaimingResidence(true)
    setError("")
    setSuccess("")
    try {
      await claimResidence(selectedResidence)
      setSuccess("Residence claimed successfully!")
      setSelectedResidence("")
    } catch (err: any) {
      setError(err.message || "Failed to claim residence")
    } finally {
      setIsClaimingResidence(false)
    }
  }

  const handleUpdatePhone = async () => {
    setIsUpdatingPhone(true)
    setError("")
    setSuccess("")
    try {
      await updateUserPhone(phoneNumber)
      setSuccess("Phone number updated successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to update phone number")
    } finally {
      setIsUpdatingPhone(false)
    }
  }

  // Group residences by street for easier selection
  const streets = ["Symor Dr", "Brothers Pl", "Fanok Rd", "Hadley Way", "Herms Pl"]

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Mail className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          
          {userProfile?.is_admin && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Administrator
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Current Residence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            My Residence
          </CardTitle>
          <CardDescription>
            {userProfile?.residence_id 
              ? "Your claimed residence in the neighborhood"
              : "Claim your residence to appear in the directory"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProfile?.residences ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Residence Claimed</span>
              </div>
              <p className="text-lg font-medium">{userProfile.residences.address}</p>
              <p className="text-slate-600">{userProfile.residences.last_name} Residence</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600">
                Select your residence from the list below to claim it. This will link your account to your home address.
              </p>
              <div className="space-y-2">
                <Label htmlFor="residence">Select Your Residence</Label>
                <Select value={selectedResidence} onValueChange={setSelectedResidence}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your address..." />
                  </SelectTrigger>
                  <SelectContent>
                    {streets.map((street) => {
                      const streetResidences = residences.filter(r => r.street_name === street)
                      if (streetResidences.length === 0) return null
                      return (
                        <div key={street}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-slate-500 bg-slate-100">
                            {street}
                          </div>
                          {streetResidences.map((residence) => (
                            <SelectItem key={residence.id} value={residence.id}>
                              {residence.address} - {residence.last_name}
                            </SelectItem>
                          ))}
                        </div>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleClaimResidence} 
                disabled={!selectedResidence || isClaimingResidence}
              >
                {isClaimingResidence ? "Claiming..." : "Claim This Residence"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Your phone number will be visible to other neighbors in the directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleUpdatePhone} 
            disabled={isUpdatingPhone}
            variant="outline"
          >
            {isUpdatingPhone ? "Saving..." : "Save Phone Number"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
