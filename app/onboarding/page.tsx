import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import OwnerOnboarding from "@/components/owner-onboarding"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("email, phone_number, onboarding_completed, residence_id, residences(address)")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_completed) redirect("/calendar")

  const residence = Array.isArray(profile?.residences) ? profile.residences[0] : profile?.residences

  return (
    <OwnerOnboarding
      email={user.email ?? profile?.email ?? ""}
      address={residence?.address ?? null}
      currentPhone={profile?.phone_number ?? ""}
    />
  )
}
