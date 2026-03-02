import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingContent } from "@/components/onboarding-content"

export const metadata = {
  title: "Welcome to Your Neighborhood",
  description: "Complete your profile and explore your community",
}

export default async function OnboardingPage() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log("[v0] Onboarding - Auth user:", user?.email, authError?.message)
    
    // If not authenticated, redirect to login
    if (!user || authError) {
      console.log("[v0] No user or auth error, redirecting to login")
      redirect("/auth/login")
    }

    // Get user profile with error handling
    let profile = null
    try {
      const { data: userProfileData, error: profileError } = await supabase
        .from("users")
        .select("*, residences(*)")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("[v0] Profile query error:", profileError.message)
      } else {
        profile = userProfileData
      }
      
      console.log("[v0] Profile loaded:", profile?.email, "Has phone:", !!profile?.phone_number)
    } catch (err: any) {
      console.error("[v0] Error fetching profile:", err.message)
    }

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
  } catch (err: any) {
    console.error("[v0] Onboarding page error:", err.message)
    // Fallback redirect if something goes wrong
    redirect("/auth/login")
  }
}
