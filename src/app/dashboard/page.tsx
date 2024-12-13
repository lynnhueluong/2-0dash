// src/app/dashboard/page.tsx
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.name}</p>
    </div>
  );
}