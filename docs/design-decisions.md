# Career Translator Design Decisions

## Core Signals (From Andrew Yeung's 2026 Predictions)
1. Multi-hyphenate careers are emerging - Build for portfolio careers, not linear paths
2. Physical experiences are scarce - IRL events must be integrated into digital tool
3. High agency people need better tools - Build judgment amplifier, not replacement
4. Voice is the differentiator - Bold, direct, colloquial language (never corporate)

## Technical Decisions
- Portfolio careers: User can define 3+ simultaneous roles
- Context-specific priorities: Different weighting for each portfolio piece
- Mandatory tension confrontation: Cannot skip conflicting priorities
- Event flywheel: Pre-event matching + post-event reflection - updated preferences
- Waterfall stack: Visual hierarchy for skill categorization
- Opening hero: "Why" screen before forms start
- Braindump cap: 1000 characters max per section

## Brand Voice Rules
- NEVER use em dashes (-), ALWAYS use hyphens (-)
- Say "dealbreakers" not "priorities"
- Say "eat dirt number" not "optimal target"
- Say "make-or-break" not "critical success factor"
- Direct, casual, occasionally profane

## Visual System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#3d6aff` | Main accent, links, CTAs |
| Success | `#e0fff1` | Positive states, confirmations |
| Warning | `#ff5010` | Tension alerts, deadlines |
| Background | `#f7faff` | Page background |
| Elevated | `#fbfff5` | Cards, modals |
| Text Primary | `#0b101f` | Main text |
| Text Secondary | `#727c9d` | Hints, labels |

### Typography
- **Railroad Gothic CC** for hero titles (uppercase, 84px, tight tracking)
- **Inter Tight** for everything else
- Tight letter-spacing throughout (-0.04em to -0.01em depending on size)

### Shadows
- **Pill Shadow (default buttons):**
  ```css
  inset 0 -2px 4px rgba(0, 0, 0, 0.1),
  0 2px 8px rgba(61, 92, 255, 0.15)
  ```
- **Glow Shadow (special moments):**
  ```css
  0 0 20px rgba(61, 92, 255, 0.6),
  0 0 40px rgba(61, 92, 255, 0.3)
  ```

### Border Radius Scale
| Size | Value |
|------|-------|
| xs | 3px |
| sm | 7px |
| md | 10px |
| lg | 15px |
| xl | 20px |
| full | 100px |

### Spacing Scale (8px base)
| Size | Value |
|------|-------|
| xs | 8px |
| sm | 16px |
| md | 24px |
| lg | 40px |
| xl | 64px |
| 2xl | 96px |

## CSS Class Naming Convention
All Career Translator brand classes are prefixed with `ct-` to avoid conflicts:
- `ct-btn`, `ct-btn-primary`, `ct-btn-lg`
- `ct-card`, `ct-card-highlight`
- `ct-input-text`, `ct-textarea`
- `ct-waterfall-stack`, `ct-bucket-level-1`

## Tailwind Integration
Brand colors and spacing are available as Tailwind utilities:
- `bg-ct-primary`, `text-ct-warning`
- `rounded-ct-lg`, `shadow-ct-pill-sm`
- `tracking-ct-tight`, `font-railroad`

## Files Structure
```
src/
  styles/
    career-translator-brand.css  # Complete brand CSS system
  app/
    globals.css                   # Tailwind + brand imports
docs/
  design-decisions.md            # This file
tailwind.config.js               # Extended with brand tokens
```
