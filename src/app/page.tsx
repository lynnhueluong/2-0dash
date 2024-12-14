import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Third Space for Ambition
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Your career matching platform
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/api/auth/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}