// src/app/dashboard/page.tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome back, {session.user.name}!</h1>
        <p className="text-gray-600 mb-4">
          This is your personal dashboard where you can manage your account and access your data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Button asChild className="w-full">
            <Link href="/profile">View Profile</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/settings">Settings</Link>
          </Button>
          <Button variant="secondary" asChild className="w-full">
            <Link href="/help">Help Center</Link>
          </Button>
        </div>
      </div>
      
      {/* Activity Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Last login: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}