'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push('/api/auth/logout')}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Log Out
    </button>
  );
}