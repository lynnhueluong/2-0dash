import { Suspense } from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

async function DashboardContent() {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-medium">
          Welcome {session.user.name || 'User'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Start exploring career opportunities
        </p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <main className="container mx-auto p-4">
        <DashboardContent />
      </main>
    </Suspense>
  );
}