'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import { Button } from '/Users/lynnluong/2-0dash/src/components/ui/button'

export function DashboardNav() {
  const { user } = useUser()

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                Third Space
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="text-sm text-gray-700">
                Welcome, {user.name}
              </span>
            )}
            <Link href="/api/auth/logout">
              <Button variant="outline">Logout</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}