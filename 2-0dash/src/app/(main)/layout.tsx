import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { SidebarNav } from '@/components/layout/SidebarNav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: appUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#2A2A2A] flex flex-col">
        <div className="px-4 py-5 border-b border-[#2A2A2A]">
          <Link href="/dashboard">
            <span className="text-[#D4AF37] font-mono text-xs tracking-widest uppercase font-bold">
              2.0
            </span>
          </Link>
        </div>
        <SidebarNav user={appUser} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </main>
    </div>
  )
}
