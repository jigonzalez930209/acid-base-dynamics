/**
 * ChemChart — SVG line chart for scientific data.
 * Wrapper that provides consistent styling, axis labels, legends, and theme integration.
 * Designed to be replaced by scichart-engine WebGL renderer when installed.
 */
import { useMemo } from "react"
import { useTheme } from "next-themes"
import type { ChartSeries } from "../../types"
import { cn } from "@/lib/utils"

type Props = {
  title?: string
  series: ChartSeries[]
  xLabel?: string
  yLabel?: string
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  width?: number
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  className?: string
  onPointHover?: (x: number, y: number, seriesIdx: number) => void
}

const PADDING = { top: 24, right: 20, bottom: 40, left: 52 }
const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "#e879f9", "#34d399", "#fb923c",
]

export function ChemChart({
  title, series, xLabel, yLabel,
  xMin: xMinProp, xMax: xMaxProp, yMin: yMinProp, yMax: yMaxProp,
  width = 600, height = 360, showLegend = true, showGrid = true,
  className, onPointHover,
}: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const { xMin, xMax, yMin, yMax, plotW, plotH } = useMemo(() => {
    const allX = series.flatMap((s) => (s.visible !== false ? s.data.map((p) => p.x) : []))
    const allY = series.flatMap((s) => (s.visible !== false ? s.data.map((p) => p.y) : []))
    const autoXMin = allX.length ? Math.min(...allX) : 0
    const autoXMax = allX.length ? Math.max(...allX) : 14
    const autoYMin = allY.length ? Math.min(...allY) : 0
    const autoYMax = allY.length ? Math.max(...allY) : 1
    return {
      xMin: xMinProp ?? autoXMin,
      xMax: xMaxProp ?? autoXMax,
      yMin: yMinProp ?? autoYMin,
      yMax: yMaxProp ?? (autoYMax === autoYMin ? autoYMax + 1 : autoYMax),
      plotW: width - PADDING.left - PADDING.right,
      plotH: height - PADDING.top - PADDING.bottom,
    }
  }, [series, xMinProp, xMaxProp, yMinProp, yMaxProp, width, height])

  const scaleX = (x: number) => PADDING.left + ((x - xMin) / (xMax - xMin)) * plotW
  const scaleY = (y: number) => PADDING.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH

  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"
  const textColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)"

  // Nice tick calculation
  const niceStep = (range: number, count: number) => {
    const rough = range / count
    const mag = Math.pow(10, Math.floor(Math.log10(rough)))
    const res = rough / mag
    return (res <= 1.5 ? 1 : res <= 3 ? 2 : res <= 7 ? 5 : 10) * mag
  }

  const xStep = niceStep(xMax - xMin, 7)
  const yStep = niceStep(yMax - yMin, 5)
  const xTicks: number[] = []
  const yTicks: number[] = []
  for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax + 1e-9; v += xStep) xTicks.push(Number(v.toPrecision(6)))
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax + 1e-9; v += yStep) yTicks.push(Number(v.toPrecision(6)))

  return (
    <div className={cn("flex flex-col", className)}>
      {title && <h3 className="text-sm font-medium mb-1 px-1">{title}</h3>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-full"
        style={{ aspectRatio: `${width}/${height}` }}
        role="img"
        aria-label={title ?? "Chemistry chart"}
      >
        {/* Clip path */}
        <defs>
          <clipPath id="plot-area">
            <rect x={PADDING.left} y={PADDING.top} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        {/* Grid */}
        {showGrid && (
          <g>
            {xTicks.map((v) => (
              <line key={`gx-${v}`} x1={scaleX(v)} x2={scaleX(v)} y1={PADDING.top} y2={PADDING.top + plotH} stroke={gridColor} />
            ))}
            {yTicks.map((v) => (
              <line key={`gy-${v}`} x1={PADDING.left} x2={PADDING.left + plotW} y1={scaleY(v)} y2={scaleY(v)} stroke={gridColor} />
            ))}
          </g>
        )}

        {/* Axes */}
        <line x1={PADDING.left} x2={PADDING.left + plotW} y1={PADDING.top + plotH} y2={PADDING.top + plotH} stroke={textColor} strokeWidth={1} />
        <line x1={PADDING.left} x2={PADDING.left} y1={PADDING.top} y2={PADDING.top + plotH} stroke={textColor} strokeWidth={1} />

        {/* X ticks + labels */}
        {xTicks.map((v) => (
          <g key={`xt-${v}`}>
            <line x1={scaleX(v)} x2={scaleX(v)} y1={PADDING.top + plotH} y2={PADDING.top + plotH + 4} stroke={textColor} />
            <text x={scaleX(v)} y={PADDING.top + plotH + 16} textAnchor="middle" fill={textColor} fontSize={10}>{v}</text>
          </g>
        ))}

        {/* Y ticks + labels */}
        {yTicks.map((v) => (
          <g key={`yt-${v}`}>
            <line x1={PADDING.left - 4} x2={PADDING.left} y1={scaleY(v)} y2={scaleY(v)} stroke={textColor} />
            <text x={PADDING.left - 8} y={scaleY(v) + 3} textAnchor="end" fill={textColor} fontSize={10}>
              {Math.abs(v) < 0.01 && v !== 0 ? v.toExponential(0) : Number(v.toPrecision(3))}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        {xLabel && (
          <text x={PADDING.left + plotW / 2} y={height - 4} textAnchor="middle" fill={textColor} fontSize={11} fontWeight={500}>{xLabel}</text>
        )}
        {yLabel && (
          <text x={14} y={PADDING.top + plotH / 2} textAnchor="middle" fill={textColor} fontSize={11} fontWeight={500}
            transform={`rotate(-90, 14, ${PADDING.top + plotH / 2})`}>{yLabel}</text>
        )}

        {/* Series */}
        <g clipPath="url(#plot-area)">
          {series.map((s, si) => {
            if (s.visible === false || s.data.length === 0) return null
            const color = s.color || CHART_COLORS[si % CHART_COLORS.length]
            const d = s.data
              .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x).toFixed(2)},${scaleY(p.y).toFixed(2)}`)
              .join(" ")
            return (
              <path
                key={si}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={1.8}
                strokeDasharray={s.lineStyle === "dashed" ? "6,3" : s.lineStyle === "dotted" ? "2,3" : undefined}
                data-series={s.label}
                onPointerMove={(e) => {
                  if (!onPointHover) return
                  const svg = (e.target as SVGElement).closest("svg")
                  if (!svg) return
                  const pt = svg.createSVGPoint()
                  pt.x = e.clientX; pt.y = e.clientY
                  const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse())
                  const dataX = xMin + ((svgP.x - PADDING.left) / plotW) * (xMax - xMin)
                  const dataY = yMax - ((svgP.y - PADDING.top) / plotH) * (yMax - yMin)
                  onPointHover(dataX, dataY, si)
                }}
              />
            )
          })}
        </g>
      </svg>

      {/* Legend */}
      {showLegend && series.length > 1 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 mt-1">
          {series.map((s, i) => (
            s.visible !== false && (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                {s.label}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
