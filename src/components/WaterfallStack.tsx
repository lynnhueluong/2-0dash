'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ChevronDown, ChevronUp, Check, X, HelpCircle } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  source?: string; // Which portfolio piece it came from
}

interface WaterfallStackProps {
  skills: Skill[];
  onChange: (categorized: {
    have: Skill[];
    canLearn: Skill[];
    notPlanning: Skill[];
  }) => void;
  initialCategories?: {
    have: Skill[];
    canLearn: Skill[];
    notPlanning: Skill[];
  };
}

type BucketLevel = 'have' | 'canLearn' | 'notPlanning';

const bucketConfig = {
  have: {
    title: "I HAVE THIS",
    subtitle: "Skills you've already got in your toolkit",
    color: '#e0fff1',
    borderColor: '#e0fff1',
    textColor: '#0b101f',
    icon: <Check className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, rgba(224, 255, 241, 0.25) 0%, rgba(224, 255, 241, 0.1) 100%)',
  },
  canLearn: {
    title: "CAN LEARN THIS",
    subtitle: "Skills you\'re willing to build",
    color: '#3d6aff',
    borderColor: '#3d6aff',
    textColor: '#0b101f',
    icon: <ChevronUp className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, rgba(61, 92, 255, 0.15) 0%, rgba(61, 92, 255, 0.05) 100%)',
  },
  notPlanning: {
    title: "NOT PLANNING TO GET",
    subtitle: "Skills that aren't worth your time right now",
    color: '#727c9d',
    borderColor: '#727c9d',
    textColor: '#727c9d',
    icon: <X className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, rgba(114, 124, 157, 0.15) 0%, rgba(114, 124, 157, 0.05) 100%)',
  },
};

export default function WaterfallStack({
  skills,
  onChange,
  initialCategories,
}: WaterfallStackProps) {
  const [categories, setCategories] = useState<{
    have: Skill[];
    canLearn: Skill[];
    notPlanning: Skill[];
    uncategorized: Skill[];
  }>(() => {
    if (initialCategories) {
      const categorizedIds = [
        ...initialCategories.have,
        ...initialCategories.canLearn,
        ...initialCategories.notPlanning,
      ].map(s => s.id);

      return {
        ...initialCategories,
        uncategorized: skills.filter(s => !categorizedIds.includes(s.id)),
      };
    }
    return {
      have: [],
      canLearn: [],
      notPlanning: [],
      uncategorized: skills,
    };
  });

  const [draggedSkill, setDraggedSkill] = useState<Skill | null>(null);
  const [dragOverBucket, setDragOverBucket] = useState<BucketLevel | 'uncategorized' | null>(null);

  const moveSkill = useCallback((skill: Skill, toBucket: BucketLevel | 'uncategorized') => {
    setCategories(prev => {
      // Remove from all buckets
      const newCategories = {
        have: prev.have.filter(s => s.id !== skill.id),
        canLearn: prev.canLearn.filter(s => s.id !== skill.id),
        notPlanning: prev.notPlanning.filter(s => s.id !== skill.id),
        uncategorized: prev.uncategorized.filter(s => s.id !== skill.id),
      };

      // Add to target bucket
      newCategories[toBucket] = [...newCategories[toBucket], skill];

      // Notify parent of changes (excluding uncategorized)
      onChange({
        have: newCategories.have,
        canLearn: newCategories.canLearn,
        notPlanning: newCategories.notPlanning,
      });

      return newCategories;
    });
  }, [onChange]);

  const handleDragStart = (e: React.DragEvent, skill: Skill) => {
    setDraggedSkill(skill);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, bucket: BucketLevel | 'uncategorized') => {
    e.preventDefault();
    setDragOverBucket(bucket);
  };

  const handleDragLeave = () => {
    setDragOverBucket(null);
  };

  const handleDrop = (e: React.DragEvent, bucket: BucketLevel | 'uncategorized') => {
    e.preventDefault();
    if (draggedSkill) {
      moveSkill(draggedSkill, bucket);
    }
    setDraggedSkill(null);
    setDragOverBucket(null);
  };

  const SkillChip = ({ skill, bucket }: { skill: Skill; bucket: BucketLevel | 'uncategorized' }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      draggable
      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, skill)}
      className="group flex items-center gap-2 px-4 py-2 rounded-full cursor-grab active:cursor-grabbing transition-all"
      style={{
        background: bucket === 'uncategorized' ? 'white' : bucketConfig[bucket as BucketLevel].gradient,
        border: `2px solid ${bucket === 'uncategorized' ? '#e0e7ff' : bucketConfig[bucket as BucketLevel].borderColor}`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontWeight: '500',
          color: '#0b101f',
        }}
      >
        {skill.name}
      </span>
      {skill.source && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: '#727c9d',
            background: 'rgba(114, 124, 157, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {skill.source}
        </span>
      )}
    </motion.div>
  );

  const BucketLevel = ({
    level,
    isFirst,
    isLast,
  }: {
    level: BucketLevel;
    isFirst: boolean;
    isLast: boolean;
  }) => {
    const config = bucketConfig[level];
    const skillsInBucket = categories[level];
    const isDragOver = dragOverBucket === level;

    return (
      <motion.div
        onDragOver={(e) => handleDragOver(e, level)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, level)}
        className="relative"
        style={{
          background: config.gradient,
          border: `2px solid ${config.borderColor}`,
          borderTop: isFirst ? `2px solid ${config.borderColor}` : 'none',
          borderRadius: isFirst ? '15px 15px 0 0' : isLast ? '0 0 15px 15px' : '0',
          padding: '24px',
          marginTop: isFirst ? 0 : '-2px',
          zIndex: isFirst ? 3 : isLast ? 1 : 2,
          minHeight: '120px',
          boxShadow: isDragOver
            ? `0 0 20px ${config.color}80, 0 0 40px ${config.color}40`
            : `0 4px 12px ${config.color}30`,
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: config.color, color: config.textColor }}
          >
            {config.icon}
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: '600',
                color: '#0b101f',
                letterSpacing: '-0.01em',
              }}
            >
              {config.title}
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#727c9d',
              }}
            >
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {skillsInBucket.map((skill) => (
              <SkillChip key={skill.id} skill={skill} bucket={level} />
            ))}
          </AnimatePresence>

          {skillsInBucket.length === 0 && (
            <div
              className="w-full py-6 text-center rounded-lg border-2 border-dashed"
              style={{
                borderColor: isDragOver ? config.borderColor : 'rgba(114, 124, 157, 0.3)',
                background: isDragOver ? `${config.color}20` : 'transparent',
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: '#727c9d',
                }}
              >
                Drag skills here
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Uncategorized Skills */}
      {categories.uncategorized.length > 0 && (
        <div
          onDragOver={(e) => handleDragOver(e, 'uncategorized')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'uncategorized')}
          className="p-6 rounded-xl"
          style={{
            background: 'white',
            border: '2px solid #e0e7ff',
            boxShadow: dragOverBucket === 'uncategorized'
              ? '0 0 20px rgba(61, 92, 255, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-[#727c9d]" />
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: '500',
                color: '#0b101f',
              }}
            >
              Skills to categorize
            </h3>
            <span
              className="px-2 py-1 rounded-full"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: '500',
                background: '#3d6aff',
                color: 'white',
              }}
            >
              {categories.uncategorized.length} remaining
            </span>
          </div>

          <p
            className="mb-4"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#727c9d',
            }}
          >
            Drag each skill into one of the three buckets below. Be honest - if you do not have it and do not plan to get it, that is valuable information.
          </p>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {categories.uncategorized.map((skill) => (
                <SkillChip key={skill.id} skill={skill} bucket="uncategorized" />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Waterfall Stack */}
      <div className="waterfall-stack">
        <BucketLevel level="have" isFirst={true} isLast={false} />
        <BucketLevel level="canLearn" isFirst={false} isLast={false} />
        <BucketLevel level="notPlanning" isFirst={false} isLast={true} />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between pt-4">
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: '#727c9d',
          }}
        >
          {categories.uncategorized.length === 0
            ? 'All skills categorized!'
            : `${skills.length - categories.uncategorized.length} of ${skills.length} skills categorized`}
        </p>
        {categories.uncategorized.length === 0 && (
          <div className="flex items-center gap-2 text-[#e0fff1]">
            <Check className="w-5 h-5" style={{ color: '#22c55e' }} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: '500',
                color: '#22c55e',
              }}
            >
              Complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
