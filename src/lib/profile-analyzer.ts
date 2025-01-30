// lib/profile-analyzer.ts

type SignalMetrics = {
    pattern_recognition: number;
    opportunity_readiness: number;
    energy_state: number;
    action_threshold: number;
  }
  
  type Format = 'DeepReset' | 'WeekendSprint' | 'WaveRiding';
  
  interface SignalConfig {
    trigger: string;
    weight: number;
    signals: SignalMetrics;
    format: Format;
  }
  
  type DiscoverySignals = Record<string, SignalConfig>;
  
  function isValidFormat(format: string): format is Format {
    return ['DeepReset', 'WeekendSprint', 'WaveRiding'].includes(format as Format);
  }

const DISCOVERY_SIGNALS = {
    // Chaos Indicators
    HALF_BAKED_IDEAS: {
      trigger: 'Half-baked ideas you were really excited about',
      weight: 3,
      signals: {
        pattern_recognition: 0.8,   // Strong idea generation
        opportunity_readiness: 0.7,  // Ideas exist but not executed
        energy_state: 0.9,          // High creative energy
        action_threshold: 0.6       // Medium action tendency
      },
      format: 'DeepReset'  // Needs full reset to act on ideas
    },
    UNUSED_CONTACTS: {
      trigger: "Contacts you've saved from networking events but never circled back to",
      weight: 2,
      signals: {
        pattern_recognition: 0.6,    // Sees networking value
        opportunity_readiness: 0.8,   // Has resources ready
        energy_state: 0.5,           // Low activation energy
        action_threshold: 0.4        // Low action tendency
      },
      format: 'WeekendSprint'  // Quick activation needed
    },
    SAVED_CONTENT: {
      trigger: `You've saved 17 "day in the life of [dream job]" videos/productivity tweets`,
      weight: 2,
      signals: {
        pattern_recognition: 0.7,    // Clear vision
        opportunity_readiness: 0.9,   // High aspiration
        energy_state: 0.8,           // Good energy for change
        action_threshold: 0.5        // Medium-low action
      },
      format: 'WeekendSprint'  // Needs quick path to action
    },
  
    // Frustration Triggers
    MISSED_LAUNCH: {
      trigger: `Someone just launched the idea that's been sitting in your notes app`,
      weight: 4,  // Highest weight - peak motivation
      signals: {
        pattern_recognition: 0.9,    // Validated idea spotting
        opportunity_readiness: 0.9,   // Market timing proven
        energy_state: 1.0,           // Peak frustration energy
        action_threshold: 0.8        // High action potential
      },
      format: 'DeepReset'  // Need complete pattern interrupt
    },
    STILL_TEMPORARY: {
      trigger: `Realizing you're still using "for now" a year later`,
      weight: 3,
      signals: {
        pattern_recognition: 0.7,    // Awareness of stagnation
        opportunity_readiness: 0.8,   // Ready for change
        energy_state: 0.6,           // Frustrated but not peaked
        action_threshold: 0.7        // Building action potential
      },
      format: 'WeekendSprint'  // Needs quick win to break pattern
    },
    COFFEE_NOWHERE: {
      trigger: 'Your 5th coffee chat that feels good but goes nowhere',
      weight: 2,
      signals: {
        pattern_recognition: 0.8,    // Sees pattern of inaction
        opportunity_readiness: 0.7,   // Network exists but inactive
        energy_state: 0.7,           // Moderate frustration
        action_threshold: 0.6        // Ready for new approach
      },
      format: 'WeekendSprint'  // Needs structured networking
    },
  
    // Analysis & Blockers
    ANALYSIS_PARALYSIS: {
      trigger: 'Analysis paralysis is your toxic trait',
      weight: 3,
      signals: {
        pattern_recognition: 0.9,    // Over-analysis indicates good pattern recognition
        opportunity_readiness: 0.7,   // Sees opportunities but stuck
        energy_state: 0.5,           // Low action energy
        action_threshold: 0.4        // High resistance to action
      },
      format: 'DeepReset'  // Needs complete pattern break
    },
    BAD_PATH: {
      trigger: 'The path ahead feels like a bad copy/paste',
      weight: 3,
      signals: {
        pattern_recognition: 0.8,    // Sees misalignment
        opportunity_readiness: 0.8,   // Ready for new path
        energy_state: 0.7,           // Moderate energy
        action_threshold: 0.6        // Ready for change
      },
      format: 'DeepReset'  // Needs new pattern creation
    },
    WRONG_CIRCLE: {
      trigger: `Your circle doesn't match your ambition`,
      weight: 3,
      signals: {
        pattern_recognition: 0.8,    // Clear environment awareness
        opportunity_readiness: 0.9,   // Ready for new connections
        energy_state: 0.8,           // Strong desire for change
        action_threshold: 0.7        // Ready to act
      },
      format: 'DeepReset'  // Needs complete environment change
    },
  
    // Energy States
    TOMORROW_SYNDROME: {
      trigger: 'You relaxed today since tomorrow is definitely the day',
      weight: 2,
      signals: {
        pattern_recognition: 0.7,    // Aware of procrastination
        opportunity_readiness: 0.6,   // Opportunities identified
        energy_state: 0.4,           // Low energy state
        action_threshold: 0.3        // Very low action tendency
      },
      format: 'WeekendSprint'  // Needs quick momentum
    },
    WRONG_LIFE: {
      trigger: `Your calendar feels like someone else's life`,
      weight: 3,
      signals: {
        pattern_recognition: 0.8,    // Clear misalignment awareness
        opportunity_readiness: 0.8,   // Ready for change
        energy_state: 0.6,           // Moderate energy
        action_threshold: 0.7        // Ready to act
      },
      format: 'DeepReset'  // Needs complete reset
    }

};

interface ProfileScores extends SignalMetrics {
    [key: string]: number;
  }
  
  interface AnalysisResult {
    scores: ProfileScores;
    recommendedFormat: Format;
    readinessScore: number;
    dominantTriggers: string[];
  }
  
  interface SelectionInput {
    [key: string]: string[];
  }
  
  export function analyzeProfile(selections: SelectionInput): AnalysisResult {
    let scores: ProfileScores = {
      pattern_recognition: 0,
      opportunity_readiness: 0,
      energy_state: 0,
      action_threshold: 0
    };
    
    let totalWeight = 0;
    const formatVotes: Record<Format, number> = {
      'DeepReset': 0,
      'WeekendSprint': 0,
      'WaveRiding': 0
    };
    
    let signalStrengths: Record<string, number> = {};
  
    // Process each selection
    for (const category in selections) {
      const categorySelections = selections[category];
      if (Array.isArray(categorySelections)) {
        categorySelections.forEach(selection => {
          // Find matching signal
          Object.entries(DISCOVERY_SIGNALS).forEach(([signalKey, signal]) => {
            if (signal.trigger === selection) {
              // Add to scores
              Object.keys(signal.signals).forEach(metric => {
                if (metric in scores) {
                  scores[metric] += signal.signals[metric as keyof SignalMetrics] * signal.weight;
                }
              });
              
              // Safely update format votes with type guard
              if (isValidFormat(signal.format)) {
                formatVotes[signal.format] += signal.weight;
              }
              
              signalStrengths[signalKey] = signal.weight;
              totalWeight += signal.weight;
            }
          });
        });
      }
    }
  
    // Normalize scores
    if (totalWeight > 0) {
      Object.keys(scores).forEach(metric => {
        scores[metric] = scores[metric] / totalWeight;
      });
    }
  
    // Calculate overall readiness score
    const readinessScore = (
      scores.pattern_recognition * 0.3 +
      scores.opportunity_readiness * 0.3 +
      scores.energy_state * 0.2 +
      scores.action_threshold * 0.2
    );
  
    // Determine recommended format with type safety
    const sortedFormats = (Object.entries(formatVotes) as [Format, number][])
      .sort((a, b) => b[1] - a[1]);
    
    const recommendedFormat = sortedFormats[0][0];
  
    // Get dominant triggers
    const dominantTriggers = Object.entries(signalStrengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => key);
  
    return {
      scores,
      recommendedFormat,
      readinessScore,
      dominantTriggers
    };
  }