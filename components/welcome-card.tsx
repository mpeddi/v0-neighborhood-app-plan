'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Home, CheckCircle2 } from 'lucide-react'
import { completeOnboarding, updateUserPhone } from '@/app/actions/auth-actions'

interface WelcomeCardProps {
  userProfile: any
  onDismiss: () => void
}

export function WelcomeCard({ userProfile, onDismiss }: WelcomeCardProps) {
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(!userProfile?.phone_number)

  const handleAddPhone = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await updateUserPhone(phoneNumber)
      setShowPhoneInput(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save phone number')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      await completeOnboarding()
      onDismiss()
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding')
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Welcome to Your Neighborhood! 👋</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Let's get you set up so you can start connecting with neighbors
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Residence info */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Your Home</p>
                {userProfile?.residences ? (
                  <>
                    <p className="text-sm text-slate-600">{userProfile.residences.address}</p>
                    <p className="text-xs text-slate-500">{userProfile.residences.last_name} Residence</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Getting your residence ready...</p>
                )}
              </div>
            </div>
          </div>

          {/* Phone number section */}
          {showPhoneInput && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100 space-y-3">
              <Label htmlFor="phone" className="font-semibold text-slate-900">
                Add Your Phone Number (Optional)
              </Label>
              <p className="text-sm text-slate-600">
                Share your number so neighbors can reach out and connect with you.
              </p>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setError('')
                }}
                disabled={isLoading}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {showPhoneInput ? (
              <>
                <Button
                  onClick={handleAddPhone}
                  disabled={isLoading || !phoneNumber.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save Phone Number'}
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              </>
            ) : (
              <Button onClick={onDismiss} className="w-full">
                Got It!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
