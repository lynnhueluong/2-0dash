'use client';
import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push('/api/auth/login')}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Log In
    </button>
  );
}