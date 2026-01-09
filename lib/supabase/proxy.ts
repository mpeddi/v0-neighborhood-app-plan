import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // No auth needed - just pass through
  return NextResponse.next({
    request,
  })
}
