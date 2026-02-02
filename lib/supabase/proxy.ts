import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, just pass through - don't block requests
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  try {
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
    // Skip redirect in preview mode (when NEXT_PUBLIC_SUPABASE_URL is not set or empty)
    const isPreviewMode = !supabaseUrl || supabaseUrl === ""
    
    const isProtectedRoute = 
      request.nextUrl.pathname.startsWith("/calendar") ||
      request.nextUrl.pathname.startsWith("/directory") ||
      request.nextUrl.pathname.startsWith("/clubs") ||
      request.nextUrl.pathname.startsWith("/community") ||
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/admin")

    const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")

    // Only redirect to login if not in preview mode
    if (!user && isProtectedRoute && !isPreviewMode) {
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
  } catch (error) {
    // If anything fails in middleware, just pass through
    console.error("[v0] Middleware error:", error)
    return supabaseResponse
  }

  return supabaseResponse
}
