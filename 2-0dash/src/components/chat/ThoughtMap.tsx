'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { ThoughtNode, ThoughtNodeType } from '@/lib/types'

// Config per node type: colors, labels, grid position (col 0-2, row 0-2)
const TYPE_CONFIG: Record<ThoughtNodeType, {
  label: string
  color: string
  bg: string
  border: string
  col: number
  row: number
}> = {
  life_goal:  { label: 'Life Goals',       color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', col: 2, row: 0 },
  direction:  { label: 'Direction',        color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', col: 2, row: 1 },
  lifestyle:  { label: 'Ideal Work Life',  color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', col: 2, row: 2 },
  superpower: { label: 'Superpowers',      color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', col: 1, row: 0 },
  gap:        { label: 'Gaps to Close',    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', col: 1, row: 2 },
  situation:  { label: 'Right Now',        color: '#475569', bg: '#F8FAFC', border: '#CBD5E1', col: 0, row: 0 },
  blocker:    { label: 'Blockers',         color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', col: 0, row: 2 },
}

// Which sections connect to which (from → to)
const CONNECTIONS: Array<[ThoughtNodeType, ThoughtNodeType]> = [
  ['life_goal',  'direction'],
  ['superpower', 'direction'],
  ['gap',        'direction'],
  ['lifestyle',  'direction'],
  ['situation',  'superpower'],
  ['situation',  'blocker'],
]

interface SectionRect {
  left: number
  top: number
  right: number
  bottom: number
  centerX: number
  centerY: number
}

interface ConnectionLine {
  key: string
  d: string
}

function getSectionCenter(rect: SectionRect): { x: number; y: number } {
  return { x: rect.centerX, y: rect.centerY }
}

function bezierPath(
  fromRect: SectionRect,
  toRect: SectionRect,
  sameCol: boolean
): string {
  if (sameCol) {
    // Vertical bezier (top of lower section ← bottom of upper section)
    const x = fromRect.centerX
    const y1 = fromRect.bottom
    const y2 = toRect.top
    const cy = (y1 + y2) / 2
    return `M ${x} ${y1} C ${x} ${cy}, ${x} ${cy}, ${x} ${y2}`
  } else {
    // Horizontal bezier
    const x1 = fromRect.right
    const y1 = fromRect.centerY
    const x2 = toRect.left
    const y2 = toRect.centerY
    const cx1 = x1 + (x2 - x1) * 0.4
    const cx2 = x1 + (x2 - x1) * 0.6
    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
  }
}

interface ThoughtMapProps {
  nodes: ThoughtNode[]
}

export function ThoughtMap({ nodes }: ThoughtMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Partial<Record<ThoughtNodeType, HTMLDivElement | null>>>({})
  const [lines, setLines] = useState<ConnectionLine[]>([])
  const [tick, setTick] = useState(0)

  // Group nodes by type
  const nodesByType = nodes.reduce<Partial<Record<ThoughtNodeType, ThoughtNode[]>>>((acc, node) => {
    if (!acc[node.type]) acc[node.type] = []
    acc[node.type]!.push(node)
    return acc
  }, {})

  const activeTypes = Object.keys(nodesByType) as ThoughtNodeType[]

  // Recompute lines after render
  const computeLines = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const newLines: ConnectionLine[] = []

    for (const [fromType, toType] of CONNECTIONS) {
      const fromEl = sectionRefs.current[fromType]
      const toEl = sectionRefs.current[toType]
      if (!fromEl || !toEl) continue
      if (!activeTypes.includes(fromType) || !activeTypes.includes(toType)) continue

      const fr = fromEl.getBoundingClientRect()
      const tr = toEl.getBoundingClientRect()

      const fromRect: SectionRect = {
        left: fr.left - containerRect.left,
        top: fr.top - containerRect.top,
        right: fr.right - containerRect.left,
        bottom: fr.bottom - containerRect.top,
        centerX: fr.left + fr.width / 2 - containerRect.left,
        centerY: fr.top + fr.height / 2 - containerRect.top,
      }
      const toRect: SectionRect = {
        left: tr.left - containerRect.left,
        top: tr.top - containerRect.top,
        right: tr.right - containerRect.left,
        bottom: tr.bottom - containerRect.top,
        centerX: tr.left + tr.width / 2 - containerRect.left,
        centerY: tr.top + tr.height / 2 - containerRect.top,
      }

      const sameCol = TYPE_CONFIG[fromType].col === TYPE_CONFIG[toType].col
      const d = bezierPath(fromRect, toRect, sameCol)
      newLines.push({ key: `${fromType}-${toType}`, d })
    }

    setLines(newLines)
  }, [activeTypes])

  // Recompute on any change
  useEffect(() => {
    const t = setTimeout(computeLines, 50)
    return () => clearTimeout(t)
  }, [computeLines, tick, nodes])

  // Also recompute on resize
  useEffect(() => {
    const ro = new ResizeObserver(() => setTick(t => t + 1))
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const hasNodes = nodes.length > 0

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#FAFAFA]" ref={containerRef}>
      {/* Dot grid background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#E2E8F0" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Empty state */}
      {!hasNodes && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-center max-w-xs">
            <div className="text-4xl mb-3 opacity-30">◎</div>
            <p className="text-sm font-medium text-gray-400 mb-1">Your thought map builds here</p>
            <p className="text-xs text-gray-300">As you talk, your thinking gets mapped in real-time →</p>
          </div>
          {/* Ghost preview cards */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
            <div className="flex gap-8">
              {(['life_goal', 'superpower', 'direction'] as ThoughtNodeType[]).map(t => (
                <div key={t} className="w-36 rounded-xl p-3 border-2"
                  style={{ borderColor: TYPE_CONFIG[t].border, background: TYPE_CONFIG[t].bg }}>
                  <div className="h-2 rounded bg-current mb-2" style={{ color: TYPE_CONFIG[t].color, width: '60%' }} />
                  <div className="h-2 rounded bg-current" style={{ color: TYPE_CONFIG[t].color, width: '80%' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SVG connection lines */}
      {hasNodes && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {lines.map(line => (
            <path
              key={line.key}
              d={line.d}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.7"
            />
          ))}
        </svg>
      )}

      {/* Node grid — 3 columns, 3 rows */}
      {hasNodes && (
        <div
          className="absolute inset-0 p-6"
          style={{ zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto auto', gap: '16px', alignContent: 'start' }}
        >
          {(Object.entries(TYPE_CONFIG) as Array<[ThoughtNodeType, typeof TYPE_CONFIG[ThoughtNodeType]]>)
            .sort(([, a], [, b]) => (a.col * 3 + a.row) - (b.col * 3 + b.row))
            .map(([type, cfg]) => {
              const typeNodes = nodesByType[type]
              if (!typeNodes || typeNodes.length === 0) return (
                // Empty placeholder to maintain grid position
                <div
                  key={type}
                  style={{
                    gridColumn: cfg.col + 1,
                    gridRow: cfg.row + 1,
                  }}
                />
              )

              return (
                <div
                  key={type}
                  ref={el => { sectionRefs.current[type] = el }}
                  className="rounded-xl border overflow-hidden shadow-sm thought-node"
                  style={{
                    gridColumn: cfg.col + 1,
                    gridRow: cfg.row + 1,
                    borderColor: cfg.border,
                    background: cfg.bg,
                  }}
                >
                  {/* Section header */}
                  <div
                    className="px-3 py-2 border-b"
                    style={{ borderColor: cfg.border }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {/* Nodes */}
                  <div className="px-3 py-2 space-y-1.5">
                    {typeNodes.map(node => (
                      <div
                        key={node.id}
                        className="flex items-start gap-1.5"
                      >
                        <span
                          className="mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: cfg.color }}
                        />
                        <span className="text-xs text-gray-700 leading-snug">{node.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
