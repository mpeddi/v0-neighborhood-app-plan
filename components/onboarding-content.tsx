'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Home, Heart, CheckCircle2, ArrowRight } from 'lucide-react'
import { updateUserPhone, completeOnboarding } from '@/app/actions/auth-actions'

interface OnboardingContentProps {
  user: any
  userProfile: any
}

export function OnboardingContent({ user, userProfile }: OnboardingContentProps) {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isAddingPhone, setIsAddingPhone] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [phoneSuccess, setPhoneSuccess] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [generalError, setGeneralError] = useState('')

  useEffect(() => {
    if (userProfile?.phone_number) {
      setPhoneNumber(userProfile.phone_number)
    }
  }, [userProfile])

  const handleAddPhone = async () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Please enter a phone number')
      return
    }

    setIsAddingPhone(true)
    setPhoneError('')
    setGeneralError('')
    setPhoneSuccess(false)

    try {
      await updateUserPhone(phoneNumber)
      setPhoneSuccess(true)
      setTimeout(() => proceedToApp(), 1500)
    } catch (err: any) {
      setPhoneError(err.message || 'Failed to save phone number')
    } finally {
      setIsAddingPhone(false)
    }
  }

  const proceedToApp = async () => {
    try {
      setIsSkipping(true)
      await completeOnboarding()
      router.push('/calendar')
    } catch (err) {
      setGeneralError('Failed to proceed. Please try again.')
      setIsSkipping(false)
    }
  }

  const features = [
    {
      icon: Calendar,
      title: 'Calendar',
      description: 'View community events and add your own'
    },
    {
      icon: Users,
      title: 'Directory',
      description: 'Connect with neighbors in your area'
    },
    {
      icon: Heart,
      title: 'Community Board',
      description: 'Share items, giveaways, and ask for help'
    },
    {
      icon: Users,
      title: 'Clubs',
      description: 'Join or create neighborhood clubs'
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="shadow-lg border-red-200 w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-700 mb-4">Unable to load onboarding. Please refresh the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {generalError}
          </div>
        )}

        {/* Welcome Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome to Your Neighborhood!</CardTitle>
                <CardDescription>Let's get you set up</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Residence Assignment */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Your Home Assigned</h3>
                  {userProfile?.residences ? (
                    <>
                      <p className="text-sm text-green-700 mb-1">
                        {userProfile.residences.address}
                      </p>
                      <p className="text-xs text-green-600">
                        {userProfile.residences.last_name} Residence
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-green-700">
                      Your residence is being prepared. You'll be connected shortly.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Number Optional */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Add Your Phone Number (Optional)</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Share your number so neighbors can reach out. You can skip this for now.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value)
                      setPhoneError('')
                    }}
                    disabled={isAddingPhone}
                  />
                </div>

                {phoneError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {phoneError}
                  </div>
                )}

                {phoneSuccess && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Phone number saved! Redirecting...
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleAddPhone}
                    disabled={isAddingPhone || !phoneNumber.trim()}
                    className="flex-1"
                  >
                    {isAddingPhone ? 'Saving...' : 'Save Phone Number'}
                  </Button>
                  <Button 
                    onClick={proceedToApp}
                    variant="outline"
                    disabled={isAddingPhone || isSkipping}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">What You Can Do</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-600 mb-3">
            Ready to explore your community?
          </p>
          {!phoneSuccess && (
            <Button 
              onClick={proceedToApp}
              variant="outline"
              disabled={isSkipping}
              className="inline-flex items-center gap-2"
            >
              Go to Calendar
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
