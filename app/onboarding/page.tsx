import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingContent } from "@/components/onboarding-content"

export const metadata = {
  title: "Welcome to Your Neighborhood",
  description: "Complete your profile and explore your community",
}

export default async function OnboardingPage() {
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
  const { data: profile } = await supabase
    .from("users")
    .select("*, residences(*)")
    .eq("id", user.id)
    .maybeSingle()

  console.log("[v0] Profile:", profile?.email, "onboarding_completed:", profile?.onboarding_completed)

  // If user has completed onboarding, redirect to calendar
  if (profile?.onboarding_completed) {
    console.log("[v0] Onboarding already completed, redirecting to calendar")
    redirect("/calendar")
  }

  console.log("[v0] Showing onboarding screen")
  return (
    <main className="min-h-screen">
      <OnboardingContent user={user} userProfile={profile} />
    </main>
  )
}
