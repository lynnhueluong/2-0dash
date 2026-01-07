'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Target, Scale, MessageSquare, FileText, Map, Zap } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  const deliverables = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Career Inventory',
      description: 'Your portfolio of roles - mapped and categorized'
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: '2.0 Roadmap',
      description: 'Context-specific priorities with your dealbreakers defined'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'One-Liner',
      description: 'Multiple versions - one for each context you operate in'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Career Thesis',
      description: 'The through-line that connects all your pieces'
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'Translation Guide',
      description: 'How to talk about your multi-hyphenate career'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '3 Actions',
      description: 'Concrete next steps - not someday, now'
    }
  ];

  const valueProps = [
    {
      number: '01',
      title: 'Define YOUR priorities',
      description: "Not what LinkedIn says you should want. Not what your parents think success looks like. Your actual dealbreakers - the stuff you'd walk away over."
    },
    {
      number: '02',
      title: 'Quantify your dealbreakers',
      description: "Vague goals get vague results. We'll turn 'I want flexibility' into your eat dirt number - the minimum you need to not lose your mind."
    },
    {
      number: '03',
      title: 'Translate your story',
      description: "Multi-hyphenate careers are confusing to explain. We'll give you the words that make your portfolio make sense to anyone."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7faff]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-[#0b101f] mb-6"
            style={{
              fontSize: 'clamp(48px, 10vw, 84px)',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            TURN WHAT YOU WANT
            <br />
            <span style={{ color: '#3d6aff' }}>INTO WHAT YOU OFFER</span>
          </h1>

          <p
            className="text-[#727c9d] max-w-2xl mx-auto mb-12"
            style={{ fontSize: '20px', lineHeight: '1.6' }}
          >
            Career Translator helps multi-hyphenates define their portfolio careers,
            quantify their dealbreakers, and find the words that make it all make sense.
          </p>

          <button
            onClick={() => router.push('/forms')}
            style={{
              background: '#e0fff1',
              color: '#0b101f',
              padding: '20px 48px',
              borderRadius: '100px',
              fontSize: '18px',
              fontWeight: '500',
              boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            Start Your Career Translator
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-[#727c9d] mt-4 text-sm">
            Takes 20-30 minutes - $47
          </p>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-center mb-16"
            style={{
              fontSize: '36px',
              fontWeight: '500',
              color: '#0b101f',
              letterSpacing: '-0.02em'
            }}
          >
            How it works
          </h2>

          <div className="space-y-16">
            {valueProps.map((prop) => (
              <div key={prop.number} className="flex gap-8 items-start">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #3d6aff 0%, #e0fff1 100%)',
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>
                    {prop.number}
                  </span>
                </div>
                <div>
                  <h3
                    className="mb-3"
                    style={{
                      fontSize: '24px',
                      fontWeight: '500',
                      color: '#0b101f',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {prop.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#727c9d', lineHeight: '1.6', maxWidth: '540px' }}>
                    {prop.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="px-6 py-20" style={{ background: '#fbfff5' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-center mb-4"
            style={{
              fontSize: '36px',
              fontWeight: '500',
              color: '#0b101f',
              letterSpacing: '-0.02em'
            }}
          >
            What you walk away with
          </h2>
          <p
            className="text-center"
            style={{
              fontSize: '16px',
              color: '#727c9d',
              maxWidth: '480px',
              margin: '0 auto 64px'
            }}
          >
            Six deliverables that actually help you make decisions - not just feel good about yourself
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliverables.map((item) => (
              <div
                key={item.title}
                style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '32px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(61, 106, 255, 0.1)' }}
                >
                  <span style={{ color: '#3d6aff' }}>{item.icon}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#0b101f', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#727c9d', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 text-center" style={{ background: '#3d6aff' }}>
        <div className="max-w-3xl mx-auto">
          <h2
            style={{
              fontSize: 'clamp(32px, 6vw, 48px)',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'white',
              marginBottom: '24px',
              fontWeight: 700
            }}
          >
            READY TO GET CLEAR?
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}
          >
            Stop explaining your career in apologetic half-sentences.
            Start owning your multi-hyphenate path.
          </p>
          <button
            onClick={() => router.push('/forms')}
            style={{
              background: '#e0fff1',
              color: '#0b101f',
              padding: '20px 48px',
              borderRadius: '100px',
              fontSize: '18px',
              fontWeight: '500',
              boxShadow: '0 0 20px rgba(224, 255, 241, 0.6), 0 0 40px rgba(224, 255, 241, 0.3)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            Start Now - $47
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
