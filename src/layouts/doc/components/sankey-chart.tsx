/**
 * SVG-based Sankey diagram for the DocDashboard.
 * Rendered entirely with React SVG — no external charting libraries needed.
 */

import { useMemo } from "react"
import type { SankeyData, SankeyNode } from "../engine/sankey-builder"

type Props = {
  data: SankeyData
  title: string
  id?: string
}

const LAYER_X = [60, 220, 400, 570]
const NODE_HEIGHT = 22
const NODE_GAP = 6
const SVG_WIDTH = 680
const SVG_HEIGHT = 440
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function SankeyChart({ data, title, id = "sankey-svg" }: Props) {
  const layout = useMemo(() => {
    const layers: SankeyNode[][] = [[], [], [], []]
    for (const n of data.nodes) layers[n.layer].push(n)

    // Position nodes vertically, centered in SVG
    const positioned = new Map<string, { x: number; y: number; h: number; color: string }>()
    layers.forEach((nodes, li) => {
      const totalH = nodes.length * NODE_HEIGHT + (nodes.length - 1) * NODE_GAP
      let y = (SVG_HEIGHT - totalH) / 2
      nodes.forEach((n, ni) => {
        positioned.set(n.id, { x: LAYER_X[li], y, h: NODE_HEIGHT, color: COLORS[ni % COLORS.length] })
        y += NODE_HEIGHT + NODE_GAP
      })
    })
    return positioned
  }, [data])

  const maxCount = useMemo(() => Math.max(1, ...data.links.map((l) => l.value)), [data.links])

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <svg id={id} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto rounded-lg border border-border bg-card overflow-visible">
        {/* Links */}
        {data.links.map((link, i) => {
          const src = layout.get(link.source)
          const tgt = layout.get(link.target)
          if (!src || !tgt) return null
          const opacity = 0.15 + (link.value / maxCount) * 0.4
          const strokeW = Math.max(2, (link.value / maxCount) * 18)
          const srcX = src.x + 90
          const tgtX = tgt.x
          const srcY = src.y + src.h / 2
          const tgtY = tgt.y + tgt.h / 2
          const mx = (srcX + tgtX) / 2

          return (
            <path
              key={i}
              d={`M${srcX},${srcY} C${mx},${srcY} ${mx},${tgtY} ${tgtX},${tgtY}`}
              fill="none"
              stroke={src.color}
              strokeWidth={strokeW}
              opacity={opacity}
            />
          )
        })}

        {/* Nodes */}
        {data.nodes.map((node) => {
          const pos = layout.get(node.id)
          if (!pos) return null
          return (
            <g key={node.id}>
              <rect
                x={pos.x}
                y={pos.y}
                width={90}
                height={pos.h}
                rx={4}
                fill={pos.color}
                opacity={0.85}
              />
              <text
                x={pos.x + 45}
                y={pos.y + pos.h / 2 + 4}
                textAnchor="middle"
                fill="white"
                fontSize={9}
                fontWeight="600"
              >
                {node.label.length > 14 ? node.label.slice(0, 13) + "…" : node.label}
              </text>
              <text
                x={pos.x + 45}
                y={pos.y + pos.h + 11}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.5}
                fontSize={8}
              >
                n={node.count}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
