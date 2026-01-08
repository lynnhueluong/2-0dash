'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, MapPin, ArrowRight, Check, Star } from 'lucide-react';
import type { Preference } from '@/lib/airtable';

interface Event {
  id: string;
  name: string;
  type: 'networking' | 'workshop' | 'conference' | 'meetup';
  date: string;
  location: string;
  description: string;
  matchScore: number;
  matchReasons: string[];
}

interface EventRecommendationsProps {
  preferences: Preference[];
  portfolioPieces: Array<{ name: string; type: string }>;
  onEventSelect?: (event: Event) => void;
}

// Mock event data - in production this would come from an API
const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Multi-Hyphenate Mixer',
    type: 'networking',
    date: '2026-01-20',
    location: 'New York, NY',
    description: 'Connect with other portfolio career professionals who get that you do more than one thing.',
    matchScore: 95,
    matchReasons: ['Matches your multi-hyphenate profile', 'Great for advisory networking'],
  },
  {
    id: '2',
    name: 'Career Pivot Workshop',
    type: 'workshop',
    date: '2026-01-25',
    location: 'Virtual',
    description: 'Hands-on session for defining your next career move with clarity.',
    matchScore: 88,
    matchReasons: ['Aligned with your building status', 'Helps clarify dealbreakers'],
  },
  {
    id: '3',
    name: 'Future of Work Conference',
    type: 'conference',
    date: '2026-02-10',
    location: 'San Francisco, CA',
    description: 'Two days exploring how work is changing - perfect for consultants and advisors.',
    matchScore: 82,
    matchReasons: ['Relevant to consulting work', 'Industry connections'],
  },
];

export default function EventRecommendations({
  preferences,
  portfolioPieces,
  onEventSelect,
}: EventRecommendationsProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  // Calculate personalized event recommendations based on preferences
  const getRecommendedEvents = (): Event[] => {
    // In production, this would use actual matching logic against real events
    // For now, return mock events sorted by match score
    return [...mockEvents].sort((a, b) => b.matchScore - a.matchScore);
  };

  const events = getRecommendedEvents();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEventTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'networking':
        return <Users className="w-4 h-4" />;
      case 'workshop':
        return <Star className="w-4 h-4" />;
      case 'conference':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const EventCard = ({ event, isSelected }: { event: Event; isSelected: boolean }) => (
    <motion.button
      layout
      onClick={() => handleEventClick(event)}
      className="w-full text-left p-6 rounded-xl transition-all"
      style={{
        background: isSelected ? 'rgba(61, 106, 255, 0.05)' : 'white',
        border: isSelected ? '2px solid #3d6aff' : '2px solid #e0e7ff',
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: event.matchScore >= 90
                ? 'rgba(224, 255, 241, 0.5)'
                : 'rgba(61, 106, 255, 0.1)',
            }}
          >
            {getEventTypeIcon(event.type)}
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: '500',
                color: '#0b101f',
              }}
            >
              {event.name}
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#727c9d',
              }}
            >
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </p>
          </div>
        </div>

        <div
          className="px-3 py-1 rounded-full"
          style={{
            background: event.matchScore >= 90
              ? '#e0fff1'
              : event.matchScore >= 80
                ? 'rgba(61, 106, 255, 0.1)'
                : 'rgba(114, 124, 157, 0.1)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            color: event.matchScore >= 90 ? '#0b101f' : '#3d6aff',
          }}
        >
          {event.matchScore}% match
        </div>
      </div>

      <p
        className="mb-4"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: '#727c9d',
          lineHeight: '1.6',
        }}
      >
        {event.description}
      </p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: '#727c9d' }} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              color: '#727c9d',
            }}
          >
            {formatDate(event.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: '#727c9d' }} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              color: '#727c9d',
            }}
          >
            {event.location}
          </span>
        </div>
      </div>

      {/* Match reasons */}
      <div className="flex flex-wrap gap-2">
        {event.matchReasons.map((reason, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-3 py-1 rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              background: 'rgba(61, 106, 255, 0.05)',
              color: '#3d6aff',
            }}
          >
            <Check className="w-3 h-3" />
            {reason}
          </span>
        ))}
      </div>
    </motion.button>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(224, 255, 241, 0.5)' }}
        >
          <Calendar className="w-6 h-6" style={{ color: '#3d6aff' }} />
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
            Recommended events
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#727c9d',
            }}
          >
            Based on your priorities and portfolio - these are worth your time
          </p>
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-4 mb-8">
        <AnimatePresence mode="popLayout">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={selectedEvent?.id === event.id}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Post-event reflection prompt */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl mb-8"
          style={{
            background: 'rgba(61, 106, 255, 0.05)',
            border: '2px solid rgba(61, 106, 255, 0.2)',
          }}
        >
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontWeight: '500',
              color: '#0b101f',
              marginBottom: '8px',
            }}
          >
            After you attend
          </h3>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#727c9d',
              marginBottom: '16px',
            }}
          >
            Come back here and we will ask you a few questions. Sometimes events change how you think about your priorities - and that is valuable data.
          </p>
          <button
            onClick={() => setShowReflection(true)}
            className="flex items-center gap-2 text-[#3d6aff]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            I already attended - start reflection
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Reflection modal */}
      <AnimatePresence>
        {showReflection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowReflection(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-8"
              style={{ background: 'white' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '24px',
                  fontWeight: '500',
                  color: '#0b101f',
                  marginBottom: '8px',
                }}
              >
                Post-event reflection
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: '#727c9d',
                  marginBottom: '24px',
                }}
              >
                Did anything change how you think about your priorities?
              </p>

              <div className="space-y-4 mb-6">
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
                    What surprised you?
                  </label>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="The conversations that stuck with me..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #e0e7ff',
                      borderRadius: '10px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '16px',
                      lineHeight: '1.6',
                      resize: 'none',
                    }}
                  />
                </div>

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
                    Do you want to update any priorities?
                  </label>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-3 rounded-lg"
                      style={{
                        border: '2px solid #e0e7ff',
                        background: 'white',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        color: '#727c9d',
                      }}
                    >
                      No, they are still accurate
                    </button>
                    <button
                      className="flex-1 py-3 rounded-lg"
                      style={{
                        border: '2px solid #3d6aff',
                        background: 'rgba(61, 106, 255, 0.05)',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        color: '#3d6aff',
                      }}
                    >
                      Yes, let me update
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReflection(false)}
                  className="flex-1 py-3 rounded-full"
                  style={{
                    border: '2px solid #e0e7ff',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#727c9d',
                    background: 'white',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In production, save reflection via API
                    setShowReflection(false);
                  }}
                  className="flex-1 py-3 rounded-full"
                  style={{
                    background: '#e0fff1',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#0b101f',
                    boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(61, 92, 255, 0.15)',
                    border: 'none',
                  }}
                >
                  Save reflection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
