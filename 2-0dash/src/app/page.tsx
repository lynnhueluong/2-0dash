import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between border-b border-gray-200">
        <div className="text-blue-600 font-mono text-sm tracking-widest uppercase font-bold">
          The 2.0 Collective
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link 
            href="/signup" 
            className="text-sm px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join 2.0
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 space-y-8">
        <div className="inline-block px-3 py-1 bg-blue-600/10 border border-blue-600/30 rounded-full text-blue-600 text-xs font-mono tracking-wider uppercase">
          Career Data Infrastructure
        </div>

        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight tracking-tight">
          Stop being aimlessly ambitious.
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
          The 2.0 advancement process turns your values, skills, and priorities into a structured{' '}
          <span className="text-gray-900">Ambition Profile</span> — then matches you to the exact tools and 
          resources for exactly where you are in your career. No generic advice. No noise.
        </p>

        <Link 
          href="/signup"
          className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors"
        >
          Build my Ambition Profile →
        </Link>

        <p className="text-sm text-gray-500">Takes 45-75 minutes. Worth every minute.</p>
      </section>

      {/* Process */}
      <section className="border-t border-gray-200 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm text-gray-500 font-mono uppercase tracking-widest mb-12">
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
                <div className="text-blue-600 font-mono text-sm">{item.step}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-6 text-center text-gray-500 text-sm">
        © 2026 The 2.0 Collective · dash.the20.co
      </footer>
    </main>
  )
}
