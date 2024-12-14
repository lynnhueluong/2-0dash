// src/app/auth-component/page.tsx
import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import Image from 'next/image';
import Link from 'next/link';

// Type for component props
type PageComponent = {
  params: { [key: string]: string | string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default withPageAuthRequired(
  async function AuthComponent() {
    const session = await getSession();
    const user = session?.user;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              {user?.picture && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={user.picture}
                    alt="Profile"
                    fill
                    sizes="(max-width: 64px) 100vw, 64px"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* User Details */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.email_verified ? '✅ Verified' : '❌ Not Verified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.updated_at && new Date(user.updated_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col space-y-3">
              <Link 
                href="/dashboard"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
              <Link 
                href="/api/auth/logout"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
);