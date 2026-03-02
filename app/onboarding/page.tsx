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

  // Get user profile (handle case where it might not exist yet)
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, residences(*)")
    .eq("id", user.id)

  const profile = Array.isArray(userProfile) ? userProfile[0] : userProfile
  
  console.log("[v0] Onboarding - Profile:", profile?.email, "Phone:", profile?.phone_number)

  // If user has a phone number, they've likely completed onboarding, redirect to calendar
  if (profile?.phone_number && profile.phone_number.trim() !== "") {
    console.log("[v0] Phone already set, redirecting to calendar")
    redirect("/calendar")
  }

  console.log("[v0] Showing onboarding screen")
  return (
    <main className="min-h-screen">
      <OnboardingContent user={user} userProfile={profile} />
    </main>
  )
}
