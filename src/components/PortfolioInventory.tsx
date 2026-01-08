'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Briefcase, GraduationCap, Users, Lightbulb, Palette, MoreHorizontal, AlertCircle } from 'lucide-react';
import type { PortfolioPiece } from '@/lib/airtable';

interface PortfolioInventoryProps {
  onComplete: (data: {
    braindump: string;
    pieces: PortfolioPiece[];
  }) => void;
  initialData?: {
    braindump: string;
    pieces: PortfolioPiece[];
  };
}

const BRAINDUMP_SOFT_LIMIT = 800;
const BRAINDUMP_HARD_LIMIT = 1000;

const portfolioTypes = [
  { value: 'full-time', label: 'Full-time role', icon: <Briefcase className="w-5 h-5" /> },
  { value: 'advisory', label: 'Advisory', icon: <Users className="w-5 h-5" /> },
  { value: 'teaching', label: 'Teaching', icon: <GraduationCap className="w-5 h-5" /> },
  { value: 'consulting', label: 'Consulting', icon: <Lightbulb className="w-5 h-5" /> },
  { value: 'creative', label: 'Creative work', icon: <Palette className="w-5 h-5" /> },
  { value: 'other', label: 'Other', icon: <MoreHorizontal className="w-5 h-5" /> },
] as const;

const statusOptions = [
  { value: 'active', label: 'Currently doing this' },
  { value: 'building', label: 'Building toward this' },
  { value: 'exploring', label: 'Just exploring' },
] as const;

export default function PortfolioInventory({
  onComplete,
  initialData,
}: PortfolioInventoryProps) {
  const [step, setStep] = useState<'braindump' | 'pieces'>('braindump');
  const [braindump, setBraindump] = useState(initialData?.braindump || '');
  const [braindumpHint, setBraindumpHint] = useState<string | null>(null);
  const [pieces, setPieces] = useState<PortfolioPiece[]>(initialData?.pieces || []);
  const [editingPiece, setEditingPiece] = useState<PortfolioPiece | null>(null);

  const handleBraindumpChange = useCallback((value: string) => {
    if (value.length > BRAINDUMP_HARD_LIMIT) {
      setBraindumpHint("This is more than enough for now - we'll always come back to it. What you have here is enough to move you forward.");
      return;
    }

    setBraindump(value);

    if (value.length > BRAINDUMP_SOFT_LIMIT) {
      setBraindumpHint("That's plenty. Let's keep moving.");
    } else {
      setBraindumpHint(null);
    }
  }, []);

  const createEmptyPiece = (): PortfolioPiece => ({
    id: `piece-${Date.now()}`,
    name: '',
    type: 'full-time',
    description: '',
    skills_needed: [],
    current_status: 'active',
  });

  const addPiece = () => {
    const newPiece = createEmptyPiece();
    setEditingPiece(newPiece);
  };

  const savePiece = (piece: PortfolioPiece) => {
    setPieces(prev => {
      const existing = prev.find(p => p.id === piece.id);
      if (existing) {
        return prev.map(p => p.id === piece.id ? piece : p);
      }
      return [...prev, piece];
    });
    setEditingPiece(null);
  };

  const removePiece = (id: string) => {
    setPieces(prev => prev.filter(p => p.id !== id));
  };

  const handleComplete = () => {
    onComplete({
      braindump,
      pieces,
    });
  };

  const PieceCard = ({ piece }: { piece: PortfolioPiece }) => {
    const typeConfig = portfolioTypes.find(t => t.value === piece.type);
    const statusConfig = statusOptions.find(s => s.value === piece.current_status);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all"
        style={{
          background: 'white',
          border: '2px solid #e0e7ff',
        }}
        onClick={() => setEditingPiece(piece)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            removePiece(piece.id);
          }}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(61, 106, 255, 0.1)' }}
          >
            <span style={{ color: '#3d6aff' }}>{typeConfig?.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: '500',
                color: '#0b101f',
                marginBottom: '4px',
              }}
            >
              {piece.name || 'Untitled piece'}
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: '#727c9d',
                marginBottom: '12px',
              }}
            >
              {typeConfig?.label} - {statusConfig?.label}
            </p>

            {piece.skills_needed.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {piece.skills_needed.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      background: 'rgba(224, 255, 241, 0.5)',
                      color: '#0b101f',
                      border: '1px solid #e0fff1',
                    }}
                  >
                    {skill}
                  </span>
                ))}
                {piece.skills_needed.length > 3 && (
                  <span
                    className="px-3 py-1 rounded-full"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      background: 'rgba(114, 124, 157, 0.1)',
                      color: '#727c9d',
                    }}
                  >
                    +{piece.skills_needed.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const PieceEditor = ({ piece, onSave, onCancel }: {
    piece: PortfolioPiece;
    onSave: (piece: PortfolioPiece) => void;
    onCancel: () => void;
  }) => {
    const [localPiece, setLocalPiece] = useState(piece);
    const [skillInput, setSkillInput] = useState('');

    const addSkill = () => {
      if (skillInput.trim()) {
        setLocalPiece(prev => ({
          ...prev,
          skills_needed: [...prev.skills_needed, skillInput.trim()],
        }));
        setSkillInput('');
      }
    };

    const removeSkill = (index: number) => {
      setLocalPiece(prev => ({
        ...prev,
        skills_needed: prev.skills_needed.filter((_, i) => i !== index),
      }));
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8"
          style={{ background: 'white' }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '24px',
              fontWeight: '500',
              color: '#0b101f',
              marginBottom: '24px',
            }}
          >
            {piece.name ? 'Edit portfolio piece' : 'Add portfolio piece'}
          </h2>

          {/* Name */}
          <div className="mb-6">
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
              What do you call this?
            </label>
            <input
              type="text"
              value={localPiece.name}
              onChange={(e) => setLocalPiece(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Product lead at Acme, Startup advisor, Workshop facilitator"
              className="input-text"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e0e7ff',
                borderRadius: '7px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
              }}
            />
          </div>

          {/* Type */}
          <div className="mb-6">
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
              Type of work
            </label>
            <div className="grid grid-cols-2 gap-3">
              {portfolioTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setLocalPiece(prev => ({ ...prev, type: type.value }))}
                  className="flex items-center gap-3 p-4 rounded-lg transition-all"
                  style={{
                    border: localPiece.type === type.value ? '2px solid #3d6aff' : '2px solid #e0e7ff',
                    background: localPiece.type === type.value ? 'rgba(61, 106, 255, 0.05)' : 'white',
                  }}
                >
                  <span style={{ color: localPiece.type === type.value ? '#3d6aff' : '#727c9d' }}>
                    {type.icon}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: localPiece.type === type.value ? '#0b101f' : '#727c9d',
                    }}
                  >
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
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
              Where are you with this?
            </label>
            <div className="flex gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setLocalPiece(prev => ({ ...prev, current_status: status.value }))}
                  className="flex-1 p-3 rounded-lg transition-all"
                  style={{
                    border: localPiece.current_status === status.value ? '2px solid #3d6aff' : '2px solid #e0e7ff',
                    background: localPiece.current_status === status.value ? 'rgba(61, 106, 255, 0.05)' : 'white',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: localPiece.current_status === status.value ? '#0b101f' : '#727c9d',
                    }}
                  >
                    {status.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Skills needed */}
          <div className="mb-6">
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
              Skills needed for this
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter"
                className="flex-1"
                style={{
                  padding: '12px 16px',
                  border: '2px solid #e0e7ff',
                  borderRadius: '7px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                }}
              />
              <button
                onClick={addSkill}
                className="px-4 rounded-lg"
                style={{
                  background: '#3d6aff',
                  color: 'white',
                }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localPiece.skills_needed.map((skill, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    background: 'rgba(61, 106, 255, 0.1)',
                    color: '#0b101f',
                  }}
                >
                  {skill}
                  <button onClick={() => removeSkill(i)}>
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
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
              Quick description (optional)
            </label>
            <textarea
              value={localPiece.description}
              onChange={(e) => setLocalPiece(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What does this look like day-to-day?"
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
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-full"
              style={{
                border: '2px solid #e0e7ff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: '500',
                color: '#727c9d',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(localPiece)}
              disabled={!localPiece.name.trim()}
              className="flex-1 py-3 rounded-full transition-all"
              style={{
                background: localPiece.name.trim() ? '#e0fff1' : '#e0e7ff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: '500',
                color: localPiece.name.trim() ? '#0b101f' : '#727c9d',
                boxShadow: localPiece.name.trim()
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)'
                  : 'none',
              }}
            >
              Save piece
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'braindump' && (
          <motion.div
            key="braindump"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
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
              Your career portfolio
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
              Dump everything here - your day job, side projects, advisory gigs, teaching,
              creative work, whatever. We will sort it out together. No filter, no editing.
            </p>

            <div className="relative mb-6">
              <textarea
                value={braindump}
                onChange={(e) => handleBraindumpChange(e.target.value)}
                placeholder="I'm currently doing... I've also been exploring... On the side I..."
                rows={8}
                maxLength={BRAINDUMP_HARD_LIMIT}
                className="textarea"
                style={{
                  width: '100%',
                  padding: '20px',
                  border: '2px solid #e0e7ff',
                  borderRadius: '15px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'none',
                  background: '#fbfff5',
                }}
              />

              {/* Character count */}
              <div
                className="absolute bottom-4 right-4 flex items-center gap-2"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: braindump.length > BRAINDUMP_SOFT_LIMIT ? '#ff5010' : '#727c9d',
                }}
              >
                {braindump.length > BRAINDUMP_SOFT_LIMIT && (
                  <AlertCircle className="w-4 h-4" />
                )}
                {braindump.length} / {BRAINDUMP_HARD_LIMIT}
              </div>
            </div>

            {/* Hint message */}
            {braindumpHint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-lg mb-6"
                style={{
                  background: 'rgba(255, 80, 16, 0.1)',
                  border: '1px solid rgba(255, 80, 16, 0.3)',
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ff5010' }} />
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: '#0b101f',
                  }}
                >
                  {braindumpHint}
                </p>
              </motion.div>
            )}

            <button
              onClick={() => setStep('pieces')}
              disabled={braindump.length < 50}
              className="w-full py-4 rounded-full transition-all"
              style={{
                background: braindump.length >= 50 ? '#e0fff1' : '#e0e7ff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: '500',
                color: braindump.length >= 50 ? '#0b101f' : '#727c9d',
                boxShadow: braindump.length >= 50
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)'
                  : 'none',
                border: 'none',
                cursor: braindump.length >= 50 ? 'pointer' : 'not-allowed',
              }}
            >
              Continue to portfolio pieces
            </button>
          </motion.div>
        )}

        {step === 'pieces' && (
          <motion.div
            key="pieces"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => setStep('braindump')}
              className="flex items-center gap-2 mb-6"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: '#727c9d',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ← Back to braindump
            </button>

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
              Break it into pieces
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
              Based on your braindump, add each distinct piece of your career portfolio.
              Most multi-hyphenates have 2-4 pieces. Each one gets its own priorities later.
            </p>

            {/* Pieces grid */}
            <div className="space-y-4 mb-6">
              <AnimatePresence mode="popLayout">
                {pieces.map((piece) => (
                  <PieceCard key={piece.id} piece={piece} />
                ))}
              </AnimatePresence>

              {/* Add piece button */}
              <motion.button
                layout
                onClick={addPiece}
                className="w-full p-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:border-[#3d6aff]"
                style={{
                  border: '2px dashed #e0e7ff',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <Plus className="w-5 h-5" style={{ color: '#3d6aff' }} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    color: '#3d6aff',
                  }}
                >
                  Add portfolio piece
                </span>
              </motion.button>
            </div>

            {/* Continue button */}
            <button
              onClick={handleComplete}
              disabled={pieces.length === 0}
              className="w-full py-4 rounded-full transition-all"
              style={{
                background: pieces.length > 0 ? '#e0fff1' : '#e0e7ff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: '500',
                color: pieces.length > 0 ? '#0b101f' : '#727c9d',
                boxShadow: pieces.length > 0
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)'
                  : 'none',
                border: 'none',
                cursor: pieces.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Continue with {pieces.length} piece{pieces.length !== 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Piece Editor Modal */}
      <AnimatePresence>
        {editingPiece && (
          <PieceEditor
            piece={editingPiece}
            onSave={savePiece}
            onCancel={() => setEditingPiece(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
