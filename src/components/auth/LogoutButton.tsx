//LogoutButton.tsx

import Link from 'next/link';

export const LogoutButton = () => (
  <Link href="/api/auth/logout" className="px-4 py-2 bg-red-600 text-white rounded">
    Log Out
  </Link>
);