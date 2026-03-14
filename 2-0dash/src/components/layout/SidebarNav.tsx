'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { LayoutDashboard, Map, BookOpen, FileText, Sparkles, User, LogOut } from 'lucide-react'
import type { AppUser } from '@/lib/types'

interface SidebarNavProps {
  user: AppUser | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/define', label: 'Career Inventory', icon: BookOpen },
  { href: '/opportunity', label: '2.0 Roadmap', icon: Map },
  { href: '/narrative', label: 'Career Narrative', icon: FileText },
  { href: '/resources', label: 'My Resources', icon: Sparkles },
  { href: '/profile', label: 'My Profile', icon: User },
]

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex-1 flex flex-col py-4">
      <div className="flex-1 space-y-1 px-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname === item.href
                ? 'bg-blue-600/10 text-blue-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="px-2 border-t border-gray-200 pt-4 space-y-1">
        {user && (
          <div className="px-3 py-2 text-xs text-gray-500 truncate">
            {user.name || user.email}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
