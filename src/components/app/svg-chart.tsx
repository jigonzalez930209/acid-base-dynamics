import { useId } from "react"

import type { ReactNode } from "react"

import type { ChartPoint } from "@/features/chemistry/types/models"

type SvgChartProps = {
  xLabel: string
  yLabel: string
  xTicks: number[]
  yTicks: number[]
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  width?: number
  height?: number
  children: (frame: {
    left: number
    top: number
    width: number
    height: number
    mapX: (value: number) => number
    mapY: (value: number) => number
  }) => ReactNode
}

export const buildLinePath = (points: ChartPoint[], mapX: (value: number) => number, mapY: (value: number) => number) => {
  if (points.length === 0) {
    return ""
  }

  return `M ${points.map((point) => `${mapX(point.x)},${mapY(point.y)}`).join(" L ")}`
}

export function SvgChart({
  children,
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  xMin,
  xMax,
  yMin,
  yMax,
  width = 920,
  height = 360,
}: SvgChartProps) {
  const clipPathId = useId().replace(/:/g, "")
  const padding = { top: 24, right: 24, bottom: 48, left: 56 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const mapX = (value: number) => padding.left + ((value - xMin) / (xMax - xMin)) * innerWidth
  const mapY = (value: number) => padding.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-hidden bg-card shadow-sm">
      <defs>
        <clipPath id={clipPathId}>
          <rect x={padding.left} y={padding.top} width={innerWidth} height={innerHeight} />
        </clipPath>
      </defs>

      {yTicks.map((tick) => {
        const y = mapY(tick)
        return (
          <g key={`y-${tick}`}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" opacity="0.08" strokeDasharray="4 6" />
            <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="currentColor" opacity="0.45" fontSize="11">
              {tick}
            </text>
          </g>
        )
      })}

      {xTicks.map((tick) => {
        const x = mapX(tick)
        return (
          <g key={`x-${tick}`}>
            <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="currentColor" opacity="0.08" strokeDasharray="4 6" />
            <text x={x} y={height - padding.bottom + 20} textAnchor="middle" fill="currentColor" opacity="0.45" fontSize="11">
              {tick}
            </text>
          </g>
        )
      })}

      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" opacity="0.35" strokeWidth="1.5" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="currentColor" opacity="0.35" strokeWidth="1.5" />
      <text x={padding.left + innerWidth / 2} y={height - 8} textAnchor="middle" fill="currentColor" opacity="0.65" fontSize="12" fontWeight="600">
        {xLabel}
      </text>
      <text
        x={18}
        y={padding.top + innerHeight / 2}
        transform={`rotate(-90 18 ${padding.top + innerHeight / 2})`}
        textAnchor="middle"
        fill="currentColor"
        opacity="0.65"
        fontSize="12"
        fontWeight="600"
      >
        {yLabel}
      </text>

      <g clipPath={`url(#${clipPathId})`}>{children({ left: padding.left, top: padding.top, width: innerWidth, height: innerHeight, mapX, mapY })}</g>
    </svg>
  )
}
