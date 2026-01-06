'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Briefcase, GraduationCap, Users, Lightbulb, Palette, MoreHorizontal } from 'lucide-react';
import type { PortfolioPiece } from '@/lib/airtable';

interface ContextSelectorProps {
  pieces: PortfolioPiece[];
  completedPieces: string[]; // IDs of pieces that have been completed
  onSelect: (piece: PortfolioPiece) => void;
  onComplete: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  'full-time': <Briefcase className="w-5 h-5" />,
  'advisory': <Users className="w-5 h-5" />,
  'teaching': <GraduationCap className="w-5 h-5" />,
  'consulting': <Lightbulb className="w-5 h-5" />,
  'creative': <Palette className="w-5 h-5" />,
  'other': <MoreHorizontal className="w-5 h-5" />,
};

export default function ContextSelector({
  pieces,
  completedPieces,
  onSelect,
  onComplete,
}: ContextSelectorProps) {
  const [selectedPiece, setSelectedPiece] = useState<PortfolioPiece | null>(null);

  const allCompleted = pieces.every(p => completedPieces.includes(p.id));
  const remainingCount = pieces.filter(p => !completedPieces.includes(p.id)).length;

  const handleSelect = (piece: PortfolioPiece) => {
    if (completedPieces.includes(piece.id)) return;
    setSelectedPiece(piece);
  };

  const handleContinue = () => {
    if (selectedPiece) {
      onSelect(selectedPiece);
    }
  };

  if (allCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(224, 255, 241, 0.5)' }}
        >
          <Check className="w-10 h-10" style={{ color: '#22c55e' }} />
        </motion.div>

        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '28px',
            fontWeight: '500',
            color: '#0b101f',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          All contexts covered
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
          You've defined priorities for every piece of your portfolio.
          Now we can synthesize everything and check for tensions.
        </p>

        <button
          onClick={onComplete}
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
          Continue to synthesis
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
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
        Which context first?
      </h2>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '16px',
          color: '#727c9d',
          marginBottom: '8px',
          lineHeight: '1.6',
        }}
      >
        Each piece of your portfolio has different dealbreakers.
        Pick one to define priorities for - you'll do all of them.
      </p>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: '#3d6aff',
          marginBottom: '32px',
        }}
      >
        {remainingCount} context{remainingCount !== 1 ? 's' : ''} remaining
      </p>

      {/* Pieces list */}
      <div className="space-y-4 mb-8">
        <AnimatePresence mode="popLayout">
          {pieces.map((piece, index) => {
            const isCompleted = completedPieces.includes(piece.id);
            const isSelected = selectedPiece?.id === piece.id;

            return (
              <motion.button
                key={piece.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(piece)}
                disabled={isCompleted}
                className="w-full text-left p-6 rounded-xl transition-all"
                style={{
                  background: isCompleted
                    ? 'rgba(224, 255, 241, 0.2)'
                    : isSelected
                      ? 'rgba(61, 106, 255, 0.05)'
                      : 'white',
                  border: isCompleted
                    ? '2px solid #e0fff1'
                    : isSelected
                      ? '2px solid #3d6aff'
                      : '2px solid #e0e7ff',
                  cursor: isCompleted ? 'default' : 'pointer',
                  opacity: isCompleted ? 0.7 : 1,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isCompleted
                        ? '#e0fff1'
                        : isSelected
                          ? 'rgba(61, 106, 255, 0.1)'
                          : '#f7faff',
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" style={{ color: '#22c55e' }} />
                    ) : (
                      <span style={{ color: isSelected ? '#3d6aff' : '#727c9d' }}>
                        {typeIcons[piece.type]}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '18px',
                        fontWeight: '500',
                        color: isCompleted ? '#727c9d' : '#0b101f',
                        marginBottom: '4px',
                      }}
                    >
                      {piece.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        color: '#727c9d',
                      }}
                    >
                      {isCompleted
                        ? 'Priorities defined'
                        : piece.current_status === 'active'
                          ? 'Currently active'
                          : piece.current_status === 'building'
                            ? 'Building toward this'
                            : 'Exploring'}
                    </p>
                  </div>

                  {/* Arrow or check */}
                  {!isCompleted && (
                    <ChevronRight
                      className="w-5 h-5 flex-shrink-0"
                      style={{
                        color: isSelected ? '#3d6aff' : '#727c9d',
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    />
                  )}
                </div>

                {/* Skills preview */}
                {piece.skills_needed.length > 0 && !isCompleted && (
                  <div className="flex flex-wrap gap-2 mt-4 pl-16">
                    {piece.skills_needed.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '12px',
                          background: isSelected
                            ? 'rgba(61, 106, 255, 0.1)'
                            : 'rgba(114, 124, 157, 0.1)',
                          color: isSelected ? '#3d6aff' : '#727c9d',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {piece.skills_needed.length > 4 && (
                      <span
                        className="px-3 py-1 rounded-full"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '12px',
                          background: 'rgba(114, 124, 157, 0.1)',
                          color: '#727c9d',
                        }}
                      >
                        +{piece.skills_needed.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!selectedPiece}
        className="w-full py-4 rounded-full transition-all"
        style={{
          background: selectedPiece ? '#e0fff1' : '#e0e7ff',
          fontFamily: "'Inter', sans-serif",
          fontSize: '18px',
          fontWeight: '500',
          color: selectedPiece ? '#0b101f' : '#727c9d',
          boxShadow: selectedPiece
            ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)'
            : 'none',
          border: 'none',
          cursor: selectedPiece ? 'pointer' : 'not-allowed',
        }}
      >
        {selectedPiece
          ? `Define priorities for ${selectedPiece.name}`
          : 'Select a context to continue'}
      </button>
    </div>
  );
}
