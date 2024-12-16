// src/app/page.tsx
'use client';

import dynamic from 'next/dynamic'
import { useUser } from '@auth0/nextjs-auth0/client'

const AuthFlow = dynamic(
  () => import('@/components/framer/AuthFlow'),
  { ssr: false }
)

export default function Home() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AuthFlow 
        buttonText="Get Started"
        buttonColor="#0099ff"
        redirectUrl="/dashboard"
        showUserProfile={true}
        theme="light"
      />
    </main>
  )
}