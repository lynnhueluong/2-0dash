import { DashboardNav } from '../../components/dashboard-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="mx-auto max-w-7xl p-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}