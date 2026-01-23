import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, just pass through (allow access to auth pages)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase env vars not available in middleware")
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if exists
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/calendar") ||
    request.nextUrl.pathname.startsWith("/directory") ||
    request.nextUrl.pathname.startsWith("/clubs") ||
    request.nextUrl.pathname.startsWith("/community") ||
    request.nextUrl.pathname.startsWith("/admin")

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/calendar"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
