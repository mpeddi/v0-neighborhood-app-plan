import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingContent } from "@/components/onboarding-content"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Welcome to Your Neighborhood",
  description: "Complete your profile and explore your community",
}

export default async function OnboardingPage() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log("[v0] Onboarding page - User:", user?.email)
    
    // If not authenticated, redirect to login
    if (!user) {
      console.log("[v0] No user, redirecting to login")
      redirect("/auth/login")
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*, residences(*)")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[v0] Profile query error:", profileError)
      throw new Error(`Profile query failed: ${profileError.message}`)
    }
    
    console.log("[v0] Profile loaded:", {
      email: profile?.email,
      has_residence: !!profile?.residences,
      onboarding_completed: profile?.onboarding_completed
    })

    // If user has completed onboarding, redirect to calendar
    if (profile?.onboarding_completed) {
      console.log("[v0] Onboarding already completed, redirecting to calendar")
      redirect("/calendar")
    }

    console.log("[v0] Rendering onboarding screen")
    return (
      <main className="min-h-screen">
        <OnboardingContent user={user} userProfile={profile} />
      </main>
    )
  } catch (err: any) {
    console.error("[v0] Onboarding page fatal error:", err.message, err.stack)
    
    // Fallback error UI
    return (
      <main className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-lg font-semibold text-red-900">Onboarding Error</h2>
            <p className="text-sm text-red-700">{err.message}</p>
            <p className="text-xs text-red-600">Check console for details</p>
            <Button onClick={() => window.location.href = '/calendar'}>
              Go to Calendar
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }
}
