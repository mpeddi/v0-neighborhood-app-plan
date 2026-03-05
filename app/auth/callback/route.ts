import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type")

  if (code) {
    const supabase = await createClient()
    
    // Handle password recovery flow
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/auth/reset-password?code=${code}`)
    }
    
    // Handle normal sign-up/sign-in flow
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to calendar - welcome card shows if onboarding not completed
      return NextResponse.redirect(`${origin}/calendar`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
