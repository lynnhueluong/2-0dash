// src/app/dashboard/page.tsx
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

export default withPageAuthRequired(
  async function DashboardPage() {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome to your protected dashboard!</p>
      </div>
    );
  }
);