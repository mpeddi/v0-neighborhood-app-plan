import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">The Symor Driver</h1>
          <p className="text-slate-600">Morris Township Neighborhood Hub</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem signing you in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                The sign-in link may have expired or already been used. Please request a new link to continue.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Try Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
