"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpWithPassword, signInWithPassword, resetPassword } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [success, setSuccess] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const result = await signInWithPassword(email, password)

      if (!result.success) {
        setError(result.error || "Invalid email or password")
        setLoading(false)
        return
      }

      router.replace("/calendar")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const result = await signUpWithPassword(email, password)

      if (!result.success) {
        setError(result.error || "Invalid email")
        setLoading(false)
        return
      }

      setSuccess(result.message || "Account created. Check your email to confirm your account, then sign in.")
      setMode("sign-in")
      setPassword("")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await resetPassword(resetEmail)

      if (result.success) {
        setResetSent(true)
      } else {
        setError(result.error || "An error occurred")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === "sign-up") return handleSignUp(e)
    return handleSignIn(e)
  }

  if (showResetPassword) {
    if (resetSent) {
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
                  If an account exists with <strong>{resetEmail}</strong>, you will receive a password reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-slate-600">
                    Click the link in your email to reset your password. The link will expire in 1 hour.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setShowResetPassword(false)
                      setResetSent(false)
                      setResetEmail("")
                    }}
                  >
                    Back to Sign In
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
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setShowResetPassword(false)
                      setError("")
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
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
              {mode === "sign-in" ? "Sign in to your neighborhood account" : "Create your new owner account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
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
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <p className="text-xs text-slate-500">
                    Minimum 8 characters
                  </p>
                </div>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                {success && <p role="status" className="text-sm text-green-700">{success}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (mode === "sign-in" ? "Signing in..." : "Creating account...") : mode === "sign-in" ? "Sign In" : "Create Account"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-slate-600 hover:text-slate-900"
                  onClick={() => {
                    setMode(mode === "sign-in" ? "sign-up" : "sign-in")
                    setError("")
                    setSuccess("")
                  }}
                >
                  {mode === "sign-in" ? "New owner? Create an account" : "Already have an account? Sign in"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-slate-600 hover:text-slate-900"
                  onClick={() => setShowResetPassword(true)}
                >
                  Forgot your password?
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
