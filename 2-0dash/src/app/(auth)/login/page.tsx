import { Suspense } from 'react'
import LoginForm from './LoginForm'

// page.tsx stays a Server Component and wraps LoginForm in Suspense.
// This satisfies Next.js 15's requirement that any Client Component
// calling useSearchParams() must have a Suspense boundary above it.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
