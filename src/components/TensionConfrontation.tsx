'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowUp, ArrowDown, Check, AlertCircle } from 'lucide-react';
import type { Tension } from '@/lib/airtable';

interface TensionConfrontationProps {
  tensions: Tension[];
  onComplete: (resolvedTensions: Tension[]) => void;
  onSkipAttempt?: () => void; // Called when user tries to skip
}

const MIN_REASONING_WORDS = 20;

const tensionTypeConfig = {
  time: {
    icon: '⏰',
    title: 'Time Conflict',
    color: '#ff5010',
    bgColor: 'rgba(255, 80, 16, 0.1)',
  },
  priority: {
    icon: '⚖️',
    title: 'Priority Trade-off',
    color: '#3d6aff',
    bgColor: 'rgba(61, 106, 255, 0.1)',
  },
  resource: {
    icon: '🎯',
    title: 'Resource Conflict',
    color: '#727c9d',
    bgColor: 'rgba(114, 124, 157, 0.1)',
  },
};

export default function TensionConfrontation({
  tensions,
  onComplete,
  onSkipAttempt,
}: TensionConfrontationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedTensions, setResolvedTensions] = useState<Tension[]>([]);
  const [rankedPreferences, setRankedPreferences] = useState<string[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const currentTension = tensions[currentIndex];
  const config = currentTension ? tensionTypeConfig[currentTension.type] : null;

  const wordCount = reasoning.trim().split(/\s+/).filter(Boolean).length;
  const hasEnoughWords = wordCount >= MIN_REASONING_WORDS;

  const initializeRanking = useCallback(() => {
    if (currentTension && rankedPreferences.length === 0) {
      setRankedPreferences([...currentTension.conflicting_preferences]);
    }
  }, [currentTension, rankedPreferences.length]);

  // Initialize on mount/tension change
  useState(() => {
    initializeRanking();
  });

  const movePreference = (index: number, direction: 'up' | 'down') => {
    const newRanked = [...rankedPreferences];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex >= 0 && swapIndex < newRanked.length) {
      [newRanked[index], newRanked[swapIndex]] = [newRanked[swapIndex], newRanked[index]];
      setRankedPreferences(newRanked);
    }
  };

  const handleResolveTension = () => {
    if (!currentTension || !hasEnoughWords) return;

    const resolved: Tension = {
      ...currentTension,
      resolution: rankedPreferences.join(' > '),
      resolution_reasoning: reasoning,
    };

    const newResolved = [...resolvedTensions, resolved];
    setResolvedTensions(newResolved);

    if (currentIndex < tensions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRankedPreferences([]);
      setReasoning('');
    } else {
      onComplete(newResolved);
    }
  };

  const handleSkipAttempt = () => {
    setShowSkipWarning(true);
    onSkipAttempt?.();
  };

  if (tensions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(224, 255, 241, 0.5)' }}
        >
          <Check className="w-8 h-8" style={{ color: '#22c55e' }} />
        </div>
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '24px',
            fontWeight: '500',
            color: '#0b101f',
            marginBottom: '8px',
          }}
        >
          No tensions detected
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: '#727c9d',
          }}
        >
          Your priorities seem aligned. That's rare - nice work being clear about what you want.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 80, 16, 0.1)' }}
        >
          <AlertTriangle className="w-6 h-6" style={{ color: '#ff5010' }} />
        </div>
        <div>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '500',
              color: '#0b101f',
              letterSpacing: '-0.02em',
            }}
          >
            Time to confront some tensions
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#727c9d',
            }}
          >
            We found {tensions.length} conflict{tensions.length !== 1 ? 's' : ''} in your priorities.
            You can't skip these - that's the whole point.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
              color: '#0b101f',
            }}
          >
            Tension {currentIndex + 1} of {tensions.length}
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#727c9d',
            }}
          >
            {resolvedTensions.length} resolved
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: '#e0e7ff' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(135deg, #3d6aff 0%, #e0fff1 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / tensions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Tension Card */}
      {currentTension && config && (
        <motion.div
          key={currentTension.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-2xl p-8 mb-8"
          style={{
            background: 'white',
            border: `2px solid ${config.color}`,
            boxShadow: `0 4px 20px ${config.color}30`,
          }}
        >
          {/* Tension type badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: config.bgColor }}
          >
            <span>{config.icon}</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: '500',
                color: config.color,
              }}
            >
              {config.title}
            </span>
          </div>

          {/* Tension description */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              color: '#0b101f',
              lineHeight: '1.6',
              marginBottom: '32px',
            }}
          >
            {currentTension.description}
          </p>

          {/* Conflicting preferences */}
          <div className="mb-8">
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: '500',
                color: '#727c9d',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Rank these - what wins when they conflict?
            </h3>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {rankedPreferences.map((pref, index) => (
                  <motion.div
                    key={pref}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{
                      background: index === 0 ? 'rgba(224, 255, 241, 0.3)' : 'white',
                      border: index === 0 ? '2px solid #e0fff1' : '2px solid #e0e7ff',
                    }}
                  >
                    {/* Rank number */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: index === 0 ? '#e0fff1' : '#e0e7ff',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0b101f',
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Preference name */}
                    <span
                      className="flex-1"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '16px',
                        fontWeight: index === 0 ? '500' : '400',
                        color: '#0b101f',
                      }}
                    >
                      {pref}
                    </span>

                    {/* Move buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => movePreference(index, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          background: index === 0 ? 'transparent' : 'rgba(61, 106, 255, 0.1)',
                          opacity: index === 0 ? 0.3 : 1,
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ArrowUp className="w-4 h-4" style={{ color: '#3d6aff' }} />
                      </button>
                      <button
                        onClick={() => movePreference(index, 'down')}
                        disabled={index === rankedPreferences.length - 1}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          background: index === rankedPreferences.length - 1 ? 'transparent' : 'rgba(61, 106, 255, 0.1)',
                          opacity: index === rankedPreferences.length - 1 ? 0.3 : 1,
                          cursor: index === rankedPreferences.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ArrowDown className="w-4 h-4" style={{ color: '#3d6aff' }} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Reasoning textarea */}
          <div>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: '500',
                color: '#0b101f',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Why did you rank them this way? <span style={{ color: '#ff5010' }}>*</span>
            </label>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#727c9d',
                marginBottom: '12px',
              }}
            >
              Be honest. This is for you, not us. Minimum 20 words.
            </p>
            <div className="relative">
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="When I really think about it, I'd rather have..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: `2px solid ${hasEnoughWords ? '#e0fff1' : '#e0e7ff'}`,
                  borderRadius: '10px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'none',
                  background: hasEnoughWords ? 'rgba(224, 255, 241, 0.1)' : 'white',
                }}
              />
              <div
                className="absolute bottom-3 right-3"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: hasEnoughWords ? '#22c55e' : '#727c9d',
                }}
              >
                {wordCount} / {MIN_REASONING_WORDS} words
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skip warning */}
      <AnimatePresence>
        {showSkipWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 rounded-lg mb-6"
            style={{
              background: 'rgba(255, 80, 16, 0.1)',
              border: '1px solid rgba(255, 80, 16, 0.3)',
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ff5010' }} />
            <div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0b101f',
                  marginBottom: '4px',
                }}
              >
                You can't skip this
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: '#727c9d',
                }}
              >
                Unresolved tensions lead to paralysis and regret. Take 2 minutes to really think about what matters more to you. Future you will thank present you.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSkipAttempt}
          className="px-6 py-4 rounded-full"
          style={{
            border: '2px solid #e0e7ff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: '500',
            color: '#727c9d',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Skip this
        </button>

        <button
          onClick={handleResolveTension}
          disabled={!hasEnoughWords}
          className="flex-1 py-4 rounded-full transition-all"
          style={{
            background: hasEnoughWords ? '#e0fff1' : '#e0e7ff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            fontWeight: '500',
            color: hasEnoughWords ? '#0b101f' : '#727c9d',
            boxShadow: hasEnoughWords
              ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)'
              : 'none',
            border: 'none',
            cursor: hasEnoughWords ? 'pointer' : 'not-allowed',
          }}
        >
          {currentIndex < tensions.length - 1 ? 'Resolve & continue' : 'Resolve & finish'}
        </button>
      </div>
    </div>
  );
}
