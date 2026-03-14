import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between border-b border-[#2A2A2A]">
        <div className="text-[#D4AF37] font-mono text-sm tracking-widest uppercase font-bold">
          The 2.0 Collective
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[#6B6B6B] hover:text-[#FAFAFA] transition-colors">
            Sign in
          </Link>
          <Link 
            href="/signup" 
            className="text-sm px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#F0D060] transition-colors"
          >
            Join 2.0
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 space-y-8">
        <div className="inline-block px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-xs font-mono tracking-wider uppercase">
          Career Data Infrastructure
        </div>

        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight tracking-tight">
          Stop being aimlessly ambitious.
        </h1>

        <p className="text-lg md:text-xl text-[#A0A0A0] max-w-2xl leading-relaxed">
          The 2.0 advancement process turns your values, skills, and priorities into a structured{' '}
          <span className="text-[#FAFAFA]">Ambition Profile</span> — then matches you to the exact tools and 
          resources for exactly where you are in your career. No generic advice. No noise.
        </p>

        <Link 
          href="/signup"
          className="px-8 py-4 bg-[#D4AF37] text-[#0A0A0A] font-bold text-lg rounded-xl hover:bg-[#F0D060] transition-colors"
        >
          Build my Ambition Profile →
        </Link>

        <p className="text-sm text-[#6B6B6B]">Takes 45-75 minutes. Worth every minute.</p>
      </section>

      {/* Process */}
      <section className="border-t border-[#2A2A2A] px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm text-[#6B6B6B] font-mono uppercase tracking-widest mb-12">
            The Process
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Career Inventory',
                description: "Map your skills, gaps, lifestyle design, and target role. No fluff — just what's real."
              },
              {
                step: '02',
                title: '2.0 Roadmap',
                description: "Surface your values, priorities, dealbreakers, and what the next 1-3 years actually look like."
              },
              {
                step: '03',
                title: 'Career Narrative',
                description: "Synthesize everything into your communicable professional identity. Your story, finally clear."
              }
            ].map(item => (
              <div key={item.step} className="space-y-3">
                <div className="text-[#D4AF37] font-mono text-sm">{item.step}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-[#6B6B6B] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2A] px-6 py-6 text-center text-[#6B6B6B] text-sm">
        © 2026 The 2.0 Collective · dash.the20.co
      </footer>
    </main>
  )
}
