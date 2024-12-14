import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'

export default async function AuthComponent() {
  const session = await getSession()

  if (!session) {
    redirect('/api/auth/login')
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Protected Content</h1>
      <p className="mt-2">
        You are logged in as: {session.user.email}
      </p>
    </div>
  )
}