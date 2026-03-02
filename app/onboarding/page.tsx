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
  
  // If not authenticated, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*, residences(*)")
    .eq("id", user.id)

  const profile = Array.isArray(userProfile) ? userProfile[0] : userProfile

  // If user has a phone number, they've likely completed onboarding, redirect to calendar
  if (profile?.phone_number && profile.phone_number !== "") {
    redirect("/calendar")
  }

  return (
    <main className="min-h-screen">
      <OnboardingContent user={user} userProfile={profile} />
    </main>
  )
}
