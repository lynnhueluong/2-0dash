import Link from 'next/link';

export const LoginButton = () => (
  <Link href="/api/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded">
    Log In
  </Link>
);