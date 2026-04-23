/**
 * SVG-based violin plot for the DocDashboard.
 * Shows distribution of % error (attempt 1 vs duplicate) per sample.
 */

import { useMemo } from "react"
import { buildKDE } from "../engine/aggregator"
import type { ClassifiedRow } from "../engine/classifier"

type Props = {
  rows: ClassifiedRow[]
  title: string
  id?: string
  locale: "es" | "en"
}

const LABELS = {
  es: { attempt1: "1er intento", duplicate: "Duplicado", error: "Error %", perfect: "Error perfecto (0%)" },
  en: { attempt1: "1st attempt", duplicate: "Duplicate", error: "Error %", perfect: "Perfect error (0%)" },
}

const SAMPLE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]
const W = 700, H = 360
const PADDING = { top: 30, right: 20, bottom: 50, left: 50 }
const MAX_ERROR = 20

export function ViolinChart({ rows, title, id = "violin-svg", locale }: Props) {
  const L = LABELS[locale]

  const samples = useMemo(() => [1, 2, 3, 4] as const, [])

  const violins = useMemo(() => {
    return samples.map((s) => {
      const sRows = rows.filter((r) => r.sample === s)
      const e1 = sRows.map((r) => Math.abs(r.errorAttempt1))
      const e2 = sRows.filter((r) => r.errorDuplicate !== null).map((r) => Math.abs(r.errorDuplicate!))
      return { sample: s, kde1: buildKDE(e1, 1.5, 50), kde2: buildKDE(e2, 1.5, 50), n: sRows.length }
    })
  }, [rows, samples])

  const innerW = W - PADDING.left - PADDING.right
  const innerH = H - PADDING.top - PADDING.bottom

  const mapX = (v: number) => PADDING.left + (v / MAX_ERROR) * innerW

  const laneH = innerH / 4
  const halfViolin = laneH * 0.38

  const xTicks = [0, 2, 5, 10, 15, 20]

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <svg id={id} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg border border-border bg-card">
        {/* Grid lines */}
        {xTicks.map((t) => (
          <g key={t}>
            <line x1={mapX(t)} y1={PADDING.top} x2={mapX(t)} y2={H - PADDING.bottom} stroke="currentColor" opacity={0.08} strokeDasharray="4 4" />
            <text x={mapX(t)} y={H - PADDING.bottom + 14} textAnchor="middle" fill="currentColor" opacity={0.45} fontSize={10}>{t}</text>
          </g>
        ))}
        {/* Zero line */}
        <line x1={mapX(0)} y1={PADDING.top} x2={mapX(0)} y2={H - PADDING.bottom} stroke="currentColor" opacity={0.3} />

        {/* Axes labels */}
        <text x={PADDING.left + innerW / 2} y={H - 8} textAnchor="middle" fill="currentColor" opacity={0.6} fontSize={11} fontWeight="600">
          |{L.error}|
        </text>

        {/* Violins */}
        {violins.map(({ sample, kde1, kde2, n }, si) => {
          const laneMid = PADDING.top + laneH * si + laneH / 2
          const color = SAMPLE_COLORS[si]
          const maxD1 = Math.max(...kde1.map((p) => p.density), 0.001)
          const maxD2 = Math.max(...kde2.map((p) => p.density), 0.001)

          const path1 = kde1
            .filter((p) => p.value <= MAX_ERROR)
            .map((p) => `${mapX(p.value)},${laneMid - (p.density / maxD1) * halfViolin}`)
            .join(" L ")
          const path1b = kde1
            .filter((p) => p.value <= MAX_ERROR)
            .reverse()
            .map((p) => `${mapX(p.value)},${laneMid}`)
            .join(" L ")

          const path2 = kde2
            .filter((p) => p.value <= MAX_ERROR)
            .map((p) => `${mapX(p.value)},${laneMid + (p.density / maxD2) * halfViolin}`)
            .join(" L ")
          const path2b = kde2
            .filter((p) => p.value <= MAX_ERROR)
            .reverse()
            .map((p) => `${mapX(p.value)},${laneMid}`)
            .join(" L ")

          return (
            <g key={sample}>
              <text x={PADDING.left - 6} y={laneMid + 4} textAnchor="end" fill="currentColor" opacity={0.65} fontSize={10} fontWeight="600">
                {locale === "es" ? `M${sample}` : `S${sample}`} (n={n})
              </text>
              {/* Attempt 1 (upper half) */}
              {path1 && <path d={`M${path1} L ${path1b}`} fill={color} opacity={0.5} />}
              {/* Duplicate (lower half) */}
              {path2 && <path d={`M${path2} L ${path2b}`} fill={color} opacity={0.3} strokeDasharray="3 2" />}
              {/* Median line */}
              <line x1={mapX(2)} y1={laneMid - halfViolin * 0.9} x2={mapX(2)} y2={laneMid + halfViolin * 0.9}
                stroke="#ef4444" opacity={0.5} strokeWidth={1.5} strokeDasharray="3 2" />
              <line x1={mapX(5)} y1={laneMid - halfViolin * 0.9} x2={mapX(5)} y2={laneMid + halfViolin * 0.9}
                stroke="#f59e0b" opacity={0.5} strokeWidth={1} strokeDasharray="3 2" />
            </g>
          )
        })}

        {/* Legend */}
        <circle cx={W - 160} cy={16} r={5} fill={SAMPLE_COLORS[0]} opacity={0.6} />
        <text x={W - 152} y={20} fill="currentColor" opacity={0.6} fontSize={9}>{L.attempt1}</text>
        <rect x={W - 100} y={11} width={10} height={8} fill={SAMPLE_COLORS[0]} opacity={0.35} />
        <text x={W - 87} y={20} fill="currentColor" opacity={0.6} fontSize={9}>{L.duplicate}</text>
      </svg>
    </div>
  )
}
