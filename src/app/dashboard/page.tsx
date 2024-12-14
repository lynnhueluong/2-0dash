import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium">Welcome to your Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Start exploring career opportunities
          </p>
        </div>
      </div>
    </Suspense>
  )
}