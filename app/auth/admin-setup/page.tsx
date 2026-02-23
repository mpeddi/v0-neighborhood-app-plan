'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { verifyAdminSetupKey, setAdminPassword } from './actions'

export default function AdminSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const setupKey = searchParams.get('key')
      if (!setupKey) {
        setIsAuthorized(false)
        return
      }

      const isValid = await verifyAdminSetupKey(setupKey)
      setIsAuthorized(isValid)
    }

    checkAuth()
  }, [searchParams])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Both fields are required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const result = await setAdminPassword(password)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/page')
        }, 2000)
      } else {
        setError(result.error)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8">
          <p className="text-gray-600">Verifying authorization...</p>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-4">Not Authorized</h1>
          <p className="text-gray-600">Invalid or missing setup key.</p>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-green-600">Success!</h1>
            <p className="text-gray-600 mb-4">Your password has been set.</p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Set Admin Password</h1>
          <p className="text-gray-600 text-sm mt-2">Create a password for your admin account</p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting Password...' : 'Set Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
