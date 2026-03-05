import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log("[v0] Home page - User:", user?.email)
  
  // If not authenticated, redirect to login
  if (!user) {
    console.log("[v0] No user, redirecting to login")
    redirect("/auth/login")
  }

  // Get user profile to check onboarding status
  const { data: profile, error } = await supabase
    .from("users")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle()

  console.log("[v0] Home page - Profile query:", { 
    exists: !!profile,
    onboarding_completed: profile?.onboarding_completed,
    error: error?.message 
  })

  // If onboarding not completed, show onboarding
  if (!profile?.onboarding_completed) {
    console.log("[v0] Onboarding not completed, redirecting to onboarding")
    redirect("/onboarding")
  }

  // Otherwise go to calendar
  console.log("[v0] Onboarding completed, redirecting to calendar")
  redirect("/calendar")
}
