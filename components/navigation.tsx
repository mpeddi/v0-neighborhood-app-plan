"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Users, Heart, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth-actions"

interface NavigationProps {
  currentPage: string
  isAdmin: boolean
}

export function Navigation({ currentPage, isAdmin }: NavigationProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/directory", label: "Directory", icon: Home },
    { href: "/clubs", label: "Clubs", icon: Users },
    { href: "/community", label: "Community", icon: Heart },
  ]

  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin", icon: Settings })
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/calendar" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl text-green-800 hidden sm:inline">The Symor Driver</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
                    isActive ? "bg-green-100 text-green-800 font-medium" : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
            
            <form action={signOut}>
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:bg-slate-100 ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
