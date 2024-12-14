import { Suspense } from 'react'
import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/api/auth/login')
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium">Welcome {session.user.name}</h3>
          <p className="text-sm text-muted-foreground">
            Start exploring career opportunities
          </p>
        </div>
      </div>
    </Suspense>
  )
}