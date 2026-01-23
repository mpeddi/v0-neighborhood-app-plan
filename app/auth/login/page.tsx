"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      // Check if email is in whitelist
      const { data: allowedEmail, error: whitelistError } = await supabase
        .from("allowed_emails")
        .select("email")
        .eq("email", email.toLowerCase().trim())
        .single()

      if (whitelistError || !allowedEmail) {
        setError("This email is not authorized. Please contact the neighborhood administrator.")
        setLoading(false)
        return
      }

      // Send magic link
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      setEmailSent(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-green-800 mb-2">The Symor Driver</h1>
            <p className="text-slate-600">Morris Township Neighborhood Hub</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We sent a magic link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-600">
                  Click the link in your email to sign in. The link will expire in 1 hour.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail("")
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl">Welcome Neighbor</CardTitle>
            <CardDescription>
              Enter your email address to receive a sign-in link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMagicLink}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Only pre-approved neighborhood residents can access this app.
        </p>
      </div>
    </div>
  )
}
