/**
 * SVG-based error histogram grid (2×2) for the DocDashboard.
 * Shows |% error| distribution segmented by sample.
 */

import { useMemo } from "react"
import { buildHistogram } from "../engine/aggregator"
import type { ClassifiedRow } from "../engine/classifier"

type Props = {
  rows: ClassifiedRow[]
  title: string
  id?: string
  locale: "es" | "en"
}

const LABELS = {
  es: { error: "|Error %|", count: "N", threshold2: "2%", threshold5: "5%", noData: "Sin datos" },
  en: { error: "|Error %|", count: "N", threshold2: "2%", threshold5: "5%", noData: "No data" },
}

const SAMPLE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]
const CELL_W = 300, CELL_H = 180
const PAD = { top: 20, right: 10, bottom: 36, left: 36 }
const SVG_W = CELL_W * 2 + 20, SVG_H = CELL_H * 2 + 30
const MAX_ERR = 20, BIN_W = 1

export function ErrorHistogram({ rows, title, id = "histogram-svg", locale }: Props) {
  const L = LABELS[locale]

  const sampleData = useMemo(() => {
    return ([1, 2, 3, 4] as const).map((s) => {
      const sRows = rows.filter((r) => r.sample === s)
      const errors = sRows.map((r) => Math.abs(r.errorAttempt1))
      return { sample: s, bins: buildHistogram(errors, BIN_W, MAX_ERR), n: sRows.length }
    })
  }, [rows])

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <svg id={id} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto rounded-lg border border-border bg-card">
        {sampleData.map(({ sample, bins, n }, si) => {
          const col = si % 2
          const row = Math.floor(si / 2)
          const ox = col * (CELL_W + 20) + PAD.left
          const oy = row * (CELL_H + 30) + PAD.top
          const innerW = CELL_W - PAD.left - PAD.right
          const innerH = CELL_H - PAD.top - PAD.bottom
          const maxCount = Math.max(1, ...bins.map((b) => b.count))
          const color = SAMPLE_COLORS[si]

          const mapX = (v: number) => ox + (v / MAX_ERR) * innerW
          const mapY = (c: number) => oy + innerH - (c / maxCount) * innerH

          const xTicks = [0, 5, 10, 15, 20]

          return (
            <g key={sample}>
              {/* Subtitle */}
              <text x={ox + innerW / 2} y={oy - 6} textAnchor="middle" fill="currentColor" opacity={0.7} fontSize={9} fontWeight="700">
                {locale === "es" ? `Muestra ${sample}` : `Sample ${sample}`} (n={n})
              </text>

              {/* Bars */}
              {bins.map((bin, bi) => {
                if (bin.count === 0) return null
                const barW = Math.max(1, (BIN_W / MAX_ERR) * innerW - 1)
                return (
                  <rect
                    key={bi}
                    x={mapX(bin.lo)}
                    y={mapY(bin.count)}
                    width={barW}
                    height={(bin.count / maxCount) * innerH}
                    fill={color}
                    opacity={0.75}
                  />
                )
              })}

              {/* Threshold lines */}
              <line x1={mapX(2)} y1={oy} x2={mapX(2)} y2={oy + innerH} stroke="#ef4444" opacity={0.6} strokeWidth={1.5} strokeDasharray="3 2" />
              <text x={mapX(2) + 2} y={oy + 10} fill="#ef4444" opacity={0.7} fontSize={7}>{L.threshold2}</text>

              <line x1={mapX(5)} y1={oy} x2={mapX(5)} y2={oy + innerH} stroke="#f59e0b" opacity={0.6} strokeWidth={1} strokeDasharray="3 2" />
              <text x={mapX(5) + 2} y={oy + 10} fill="#f59e0b" opacity={0.7} fontSize={7}>{L.threshold5}</text>

              {/* Axes */}
              <line x1={ox} y1={oy + innerH} x2={ox + innerW} y2={oy + innerH} stroke="currentColor" opacity={0.3} />
              <line x1={ox} y1={oy} x2={ox} y2={oy + innerH} stroke="currentColor" opacity={0.3} />

              {xTicks.map((t) => (
                <text key={t} x={mapX(t)} y={oy + innerH + 12} textAnchor="middle" fill="currentColor" opacity={0.4} fontSize={7}>{t}</text>
              ))}

              {/* Y max label */}
              <text x={ox - 4} y={oy + 4} textAnchor="end" fill="currentColor" opacity={0.4} fontSize={7}>{maxCount}</text>
            </g>
          )
        })}

        {/* Shared axis label */}
        <text x={SVG_W / 2} y={SVG_H - 4} textAnchor="middle" fill="currentColor" opacity={0.55} fontSize={10} fontWeight="600">
          {L.error}
        </text>
      </svg>
    </div>
  )
}
