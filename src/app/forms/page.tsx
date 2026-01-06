'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ArrowLeft, Loader2 } from 'lucide-react';

import PortfolioInventory from '@/components/PortfolioInventory';
import WaterfallStack from '@/components/WaterfallStack';
import ContextSelector from '@/components/ContextSelector';
import TensionConfrontation from '@/components/TensionConfrontation';
import type { PortfolioPiece, Preference, Tension } from '@/lib/airtable';

type WizardStep =
  | 'portfolio'
  | 'skills'
  | 'context-select'
  | 'preferences'
  | 'tensions'
  | 'generating'
  | 'complete';

interface FormState {
  braindump: string;
  portfolioPieces: PortfolioPiece[];
  skills: {
    have: { id: string; name: string; source?: string }[];
    canLearn: { id: string; name: string; source?: string }[];
    notPlanning: { id: string; name: string; source?: string }[];
  };
  completedContexts: string[];
  currentContext: PortfolioPiece | null;
  preferences: Preference[];
  tensions: Tension[];
  submissionId: string | null;
}

export default function FormsPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [step, setStep] = useState<WizardStep>('portfolio');
  const [formState, setFormState] = useState<FormState>({
    braindump: '',
    portfolioPieces: [],
    skills: { have: [], canLearn: [], notPlanning: [] },
    completedContexts: [],
    currentContext: null,
    preferences: [],
    tensions: [],
    submissionId: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [user, userLoading, router]);

  // Extract all skills from portfolio pieces
  const getAllSkills = useCallback(() => {
    const skillsSet = new Map<string, { id: string; name: string; source: string }>();

    formState.portfolioPieces.forEach(piece => {
      piece.skills_needed.forEach(skill => {
        if (!skillsSet.has(skill.toLowerCase())) {
          skillsSet.set(skill.toLowerCase(), {
            id: `skill-${skill.toLowerCase().replace(/\s+/g, '-')}`,
            name: skill,
            source: piece.name,
          });
        }
      });
    });

    return Array.from(skillsSet.values());
  }, [formState.portfolioPieces]);

  // Handle portfolio completion
  const handlePortfolioComplete = async (data: { braindump: string; pieces: PortfolioPiece[] }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create submission in Airtable
      const response = await fetch('/api/airtable/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            portfolio_braindump: data.braindump,
            portfolio_pieces: data.pieces,
            portfolio_piece_1_name: data.pieces[0]?.name,
            portfolio_piece_1_type: data.pieces[0]?.type,
            portfolio_piece_1_skills: data.pieces[0]?.skills_needed.join(', '),
            portfolio_piece_2_name: data.pieces[1]?.name,
            portfolio_piece_2_type: data.pieces[1]?.type,
            portfolio_piece_2_skills: data.pieces[1]?.skills_needed.join(', '),
            portfolio_piece_3_name: data.pieces[2]?.name,
            portfolio_piece_3_type: data.pieces[2]?.type,
            portfolio_piece_3_skills: data.pieces[2]?.skills_needed.join(', '),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save portfolio');

      const result = await response.json();

      setFormState(prev => ({
        ...prev,
        braindump: data.braindump,
        portfolioPieces: data.pieces,
        submissionId: result.submissionId,
      }));

      setStep('skills');
    } catch (err) {
      setError('Failed to save your portfolio. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skills categorization
  const handleSkillsComplete = async (categorized: {
    have: { id: string; name: string; source?: string }[];
    canLearn: { id: string; name: string; source?: string }[];
    notPlanning: { id: string; name: string; source?: string }[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update submission with skills
      await fetch('/api/airtable/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: {
            skills_have: categorized.have.map(s => s.name),
            skills_can_learn: categorized.canLearn.map(s => s.name),
            skills_not_planning: categorized.notPlanning.map(s => s.name),
          },
        }),
      });

      setFormState(prev => ({
        ...prev,
        skills: categorized,
      }));

      setStep('context-select');
    } catch (err) {
      setError('Failed to save skills. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle context selection
  const handleContextSelect = (piece: PortfolioPiece) => {
    setFormState(prev => ({
      ...prev,
      currentContext: piece,
    }));
    setStep('preferences');
  };

  // Handle all contexts completed
  const handleAllContextsComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all preferences and detect tensions
      const response = await fetch(`/api/airtable/preferences?submissionId=${formState.submissionId}`);
      if (!response.ok) throw new Error('Failed to fetch preferences');

      const { preferences, tensions } = await response.json();

      setFormState(prev => ({
        ...prev,
        preferences,
        tensions,
      }));

      if (tensions.length > 0) {
        setStep('tensions');
      } else {
        setStep('generating');
        await generateOutputs();
      }
    } catch (err) {
      setError('Failed to analyze preferences. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tensions resolved
  const handleTensionsResolved = async (resolvedTensions: Tension[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update submission with resolved tensions
      await fetch('/api/airtable/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: {
            tensions_detected: resolvedTensions,
            tensions_resolved: true,
          },
        }),
      });

      setFormState(prev => ({
        ...prev,
        tensions: resolvedTensions,
      }));

      setStep('generating');
      await generateOutputs();
    } catch (err) {
      setError('Failed to save resolutions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate outputs
  const generateOutputs = async () => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'full',
          submissionId: formState.submissionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate outputs');

      setStep('complete');
    } catch (err) {
      setError('Failed to generate your Career Translator outputs. Please try again.');
      console.error(err);
      setStep('tensions'); // Go back to let them retry
    }
  };

  // Progress indicator
  const steps = ['Portfolio', 'Skills', 'Priorities', 'Tensions', 'Results'];
  const currentStepIndex = {
    portfolio: 0,
    skills: 1,
    'context-select': 2,
    preferences: 2,
    tensions: 3,
    generating: 4,
    complete: 4,
  }[step];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#f7faff] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3d6aff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faff]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/welcome')}
              className="flex items-center gap-2 text-[#727c9d] hover:text-[#0b101f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                Back
              </span>
            </button>

            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: '500',
                color: '#0b101f',
              }}
            >
              Career Translator
            </h1>

            <div style={{ width: '60px' }} /> {/* Spacer for alignment */}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((s, i) => (
                <span
                  key={s}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    fontWeight: i <= currentStepIndex ? '500' : '400',
                    color: i <= currentStepIndex ? '#3d6aff' : '#727c9d',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="h-1 bg-[#e0e7ff] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(135deg, #3d6aff 0%, #e0fff1 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="max-w-3xl mx-auto px-6 mt-6">
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(255, 80, 16, 0.1)',
              border: '1px solid rgba(255, 80, 16, 0.3)',
            }}
          >
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#ff5010' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PortfolioInventory
                onComplete={handlePortfolioComplete}
                initialData={
                  formState.portfolioPieces.length > 0
                    ? { braindump: formState.braindump, pieces: formState.portfolioPieces }
                    : undefined
                }
              />
            </motion.div>
          )}

          {step === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '28px',
                  fontWeight: '500',
                  color: '#0b101f',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em',
                }}
              >
                Categorize your skills
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  color: '#727c9d',
                  marginBottom: '32px',
                  lineHeight: '1.6',
                }}
              >
                Based on the skills needed across your portfolio pieces,
                sort each one into where you actually stand - not where you wish you were.
              </p>

              <WaterfallStack
                skills={getAllSkills()}
                onChange={handleSkillsComplete}
                initialCategories={
                  formState.skills.have.length > 0 ? formState.skills : undefined
                }
              />
            </motion.div>
          )}

          {step === 'context-select' && (
            <motion.div
              key="context-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ContextSelector
                pieces={formState.portfolioPieces}
                completedPieces={formState.completedContexts}
                onSelect={handleContextSelect}
                onComplete={handleAllContextsComplete}
              />
            </motion.div>
          )}

          {step === 'preferences' && formState.currentContext && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PreferencesForm
                context={formState.currentContext}
                submissionId={formState.submissionId!}
                onComplete={() => {
                  setFormState(prev => ({
                    ...prev,
                    completedContexts: [...prev.completedContexts, prev.currentContext!.id],
                    currentContext: null,
                  }));
                  setStep('context-select');
                }}
              />
            </motion.div>
          )}

          {step === 'tensions' && (
            <motion.div
              key="tensions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TensionConfrontation
                tensions={formState.tensions}
                onComplete={handleTensionsResolved}
              />
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <Loader2 className="w-12 h-12 animate-spin text-[#3d6aff] mx-auto mb-6" />
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '24px',
                  fontWeight: '500',
                  color: '#0b101f',
                  marginBottom: '8px',
                }}
              >
                Generating your Career Translator
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  color: '#727c9d',
                }}
              >
                This usually takes about 30 seconds...
              </p>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(224, 255, 241, 0.5)' }}
              >
                <span style={{ fontSize: '40px' }}>🎉</span>
              </div>
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '28px',
                  fontWeight: '500',
                  color: '#0b101f',
                  marginBottom: '8px',
                }}
              >
                Your Career Translator is ready
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  color: '#727c9d',
                  marginBottom: '32px',
                }}
              >
                Six deliverables, customized to your portfolio career.
              </p>
              <button
                onClick={() => router.push('/home')}
                className="py-4 px-8 rounded-full transition-all"
                style={{
                  background: '#e0fff1',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#0b101f',
                  boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                View your results
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="w-8 h-8 animate-spin text-[#3d6aff]" />
          </div>
        )}
      </main>
    </div>
  );
}

// Preferences form component for each context
function PreferencesForm({
  context,
  submissionId,
  onComplete,
}: {
  context: PortfolioPiece;
  submissionId: string;
  onComplete: () => void;
}) {
  const [section, setSection] = useState<'hopes' | 'worries' | 'interests' | 'skills'>('hopes');
  const [preferences, setPreferences] = useState<Partial<Preference>[]>([]);
  const [currentPref, setCurrentPref] = useState<Partial<Preference>>({
    portfolio_piece: context.name,
    section: 'hopes',
    preference_name: '',
    priority_level: 'important',
    definition_text: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const sections = ['hopes', 'worries', 'interests', 'skills'] as const;
  const sectionLabels = {
    hopes: 'Hopes - What do you want from this?',
    worries: 'Worries - What keeps you up at night?',
    interests: 'Interests - What gets you excited?',
    skills: 'Skills - What do you need to do well here?',
  };

  const addPreference = () => {
    if (!currentPref.preference_name?.trim()) return;

    setPreferences(prev => [...prev, {
      ...currentPref,
      preference_id: `pref-${Date.now()}`,
      submission_id: submissionId,
    }]);

    setCurrentPref({
      portfolio_piece: context.name,
      section,
      preference_name: '',
      priority_level: 'important',
      definition_text: '',
    });
  };

  const handleSectionComplete = async () => {
    const currentIndex = sections.indexOf(section);

    if (currentIndex < sections.length - 1) {
      setSection(sections[currentIndex + 1]);
      setCurrentPref(prev => ({ ...prev, section: sections[currentIndex + 1] }));
    } else {
      // Save all preferences
      setIsLoading(true);
      try {
        await fetch('/api/airtable/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences }),
        });
        onComplete();
      } catch (err) {
        console.error('Failed to save preferences:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sectionPrefs = preferences.filter(p => p.section === section);

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '28px',
          fontWeight: '500',
          color: '#0b101f',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}
      >
        {context.name}
      </h2>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '16px',
          color: '#727c9d',
          marginBottom: '32px',
        }}
      >
        Define your dealbreakers and targets for this context
      </p>

      {/* Section tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sections.map((s, i) => (
          <button
            key={s}
            onClick={() => {
              setSection(s);
              setCurrentPref(prev => ({ ...prev, section: s }));
            }}
            className="px-4 py-2 rounded-full whitespace-nowrap transition-all"
            style={{
              background: section === s ? '#3d6aff' : 'white',
              color: section === s ? 'white' : '#727c9d',
              border: section === s ? 'none' : '2px solid #e0e7ff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            {preferences.filter(p => p.section === s).length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {preferences.filter(p => p.section === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Current section */}
      <div className="mb-8">
        <h3
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            fontWeight: '500',
            color: '#0b101f',
            marginBottom: '16px',
          }}
        >
          {sectionLabels[section]}
        </h3>

        {/* Added preferences */}
        {sectionPrefs.length > 0 && (
          <div className="space-y-3 mb-6">
            {sectionPrefs.map((pref, i) => (
              <div
                key={i}
                className="p-4 rounded-lg"
                style={{
                  background: pref.priority_level === 'dealbreaker'
                    ? 'rgba(255, 80, 16, 0.1)'
                    : 'rgba(61, 106, 255, 0.05)',
                  border: pref.priority_level === 'dealbreaker'
                    ? '2px solid rgba(255, 80, 16, 0.3)'
                    : '2px solid #e0e7ff',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#0b101f',
                      }}
                    >
                      {pref.preference_name}
                    </span>
                    <span
                      className="ml-2 px-2 py-1 rounded-full"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px',
                        background: pref.priority_level === 'dealbreaker'
                          ? '#ff5010'
                          : pref.priority_level === 'important'
                            ? '#3d6aff'
                            : '#727c9d',
                        color: 'white',
                      }}
                    >
                      {pref.priority_level}
                    </span>
                  </div>
                </div>
                {pref.definition_text && (
                  <p
                    className="mt-2"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: '#727c9d',
                    }}
                  >
                    {pref.definition_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add preference form */}
        <div className="space-y-4 p-6 rounded-xl bg-white border-2 border-[#e0e7ff]">
          <input
            type="text"
            value={currentPref.preference_name}
            onChange={(e) => setCurrentPref(prev => ({ ...prev, preference_name: e.target.value }))}
            placeholder={
              section === 'hopes' ? "e.g., Remote work flexibility" :
              section === 'worries' ? "e.g., Getting stuck in one role" :
              section === 'interests' ? "e.g., Working with early-stage founders" :
              "e.g., Strategic thinking"
            }
            className="w-full"
            style={{
              padding: '14px 16px',
              border: '2px solid #e0e7ff',
              borderRadius: '7px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
            }}
          />

          <div className="flex gap-3">
            {(['dealbreaker', 'important', 'nice-to-have'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setCurrentPref(prev => ({ ...prev, priority_level: level }))}
                className="flex-1 py-3 rounded-lg transition-all"
                style={{
                  border: currentPref.priority_level === level
                    ? level === 'dealbreaker' ? '2px solid #ff5010' : '2px solid #3d6aff'
                    : '2px solid #e0e7ff',
                  background: currentPref.priority_level === level
                    ? level === 'dealbreaker' ? 'rgba(255, 80, 16, 0.1)' : 'rgba(61, 106, 255, 0.05)'
                    : 'white',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: currentPref.priority_level === level ? '#0b101f' : '#727c9d',
                }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          <textarea
            value={currentPref.definition_text}
            onChange={(e) => setCurrentPref(prev => ({ ...prev, definition_text: e.target.value }))}
            placeholder="Define what this means to you - be specific. What's your eat dirt number?"
            rows={3}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '2px solid #e0e7ff',
              borderRadius: '10px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              resize: 'none',
            }}
          />

          <button
            onClick={addPreference}
            disabled={!currentPref.preference_name?.trim()}
            className="w-full py-3 rounded-full transition-all"
            style={{
              background: currentPref.preference_name?.trim() ? '#3d6aff' : '#e0e7ff',
              color: currentPref.preference_name?.trim() ? 'white' : '#727c9d',
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              cursor: currentPref.preference_name?.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Add preference
          </button>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleSectionComplete}
        disabled={isLoading}
        className="w-full py-4 rounded-full transition-all"
        style={{
          background: '#e0fff1',
          fontFamily: "'Inter', sans-serif",
          fontSize: '18px',
          fontWeight: '500',
          color: '#0b101f',
          boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </span>
        ) : sections.indexOf(section) < sections.length - 1 ? (
          `Continue to ${sections[sections.indexOf(section) + 1]}`
        ) : (
          'Complete this context'
        )}
      </button>
    </div>
  );
}
