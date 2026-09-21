"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { completeOnboarding, updateUserPhone } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type OwnerOnboardingProps = {
  email: string
  address: string | null
  currentPhone: string
}

export default function OwnerOnboarding({ email, address, currentPhone }: OwnerOnboardingProps) {
  const router = useRouter()
  const [phone, setPhone] = useState(currentPhone)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const finish = (withPhone: boolean) => {
    setError("")
    startTransition(async () => {
      try {
        if (withPhone) await updateUserPhone(phone)
        else await completeOnboarding()
        router.replace("/calendar")
        router.refresh()
      } catch {
        setError("We could not save your onboarding details. Please try again.")
      }
    })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome, new owner</CardTitle>
          <CardDescription>Confirm your details before entering the neighborhood hub.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">
            <p><strong>Verified email:</strong> {email}</p>
            <p className="mt-2"><strong>Assigned residence:</strong> {address ?? "Your residence assignment is being finalized by an administrator."}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="owner-phone">Phone number (optional)</Label>
            <Input
              id="owner-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <p className="text-xs text-slate-500">Add a number only if you want neighbors to contact you by phone.</p>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" className="flex-1" disabled={isPending} onClick={() => finish(true)}>
              {isPending ? "Saving..." : "Save and continue"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" disabled={isPending} onClick={() => finish(false)}>
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
