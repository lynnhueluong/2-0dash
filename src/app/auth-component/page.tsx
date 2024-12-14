'use client'

import FramerAuthFlow from '@/components/framer/AuthFlow'

export default function AuthComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <FramerAuthFlow 
          buttonText="Sign in to Third Space"
          buttonColor="#0099ff"
          redirectUrl="/dashboard"
          showUserProfile={true}
          theme="light"
        />
      </div>
    </div>
  )
}