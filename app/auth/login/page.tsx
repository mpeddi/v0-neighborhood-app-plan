"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyResidence, sendMockOTP, verifyOTP, createUserAccount } from "@/lib/auth-helpers"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"address" | "otp">("address")
  const [address, setAddress] = useState("")
  const [lastName, setLastName] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [residenceData, setResidenceData] = useState<any>(null)
  const [mockOTP, setMockOTP] = useState("") // For display during development

  const handleVerifyAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await verifyResidence(address, lastName)

      if (!result.success) {
        setError(result.error || "Verification failed")
        setLoading(false)
        return
      }

      setResidenceData(result.residence)

      // Send OTP
      const otpResult = await sendMockOTP(result.residence.phone_number)
      if (otpResult.success) {
        setMockOTP(otpResult.otp || "") // For development display
        setStep("otp")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("[v0] Starting OTP verification")
      const result = await verifyOTP(residenceData.phone_number, otp)

      if (!result.success) {
        setError(result.error || "Invalid code")
        setLoading(false)
        return
      }

      console.log("[v0] OTP verified, creating user account")
      const isAdmin = address === "14 Symor Dr"

      // Always try to create/update user account (it handles existing users too)
      const userResult = await createUserAccount(residenceData.id, residenceData.phone_number, isAdmin)

      if (!userResult.success) {
        console.log("[v0] User creation failed:", userResult.error)
        setError(userResult.error || "Failed to sign in")
        setLoading(false)
        return
      }

      if (!userResult.sessionCreated) {
        console.error("[v0] Session not created")
        setError("Failed to create session. Please try again.")
        setLoading(false)
        return
      }

      console.log("[v0] Success! Redirecting to calendar")
      // Redirect to calendar
      router.push("/calendar")
      router.refresh()
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">The Symor Driver</h1>
          <p className="text-slate-600">Morris Township Neighborhood Hub</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{step === "address" ? "Welcome Neighbor" : "Verify Your Phone"}</CardTitle>
            <CardDescription>
              {step === "address"
                ? "Enter your address and last name to get started"
                : `Enter the 6-digit code sent to ${residenceData?.phone_number}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "address" ? (
              <form onSubmit={handleVerifyAddress}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="14 Symor Dr"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Thompson"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Continue"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="flex flex-col gap-6">
                  {mockOTP && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-900 font-medium">Development Mode</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your code: <strong>{mockOTP}</strong>
                      </p>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("address")}>
                    Back
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Only residents of Symor Dr, Brothers Pl, Fanok Rd, Hadley Way, and Herms Pl can access this app.
        </p>
      </div>
    </div>
  )
}
