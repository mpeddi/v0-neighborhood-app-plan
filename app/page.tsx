import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not authenticated, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to check onboarding status
  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle()

  console.log("[v0] Home page - onboarding_completed:", profile?.onboarding_completed)

  // If onboarding not completed, show onboarding
  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  // Otherwise go to calendar
  redirect("/calendar")
}
