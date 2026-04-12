import { W } from "@/features/advanced/complexation-explorer-shared"

type Segment = {
  x1: number
  x2: number
  label: string
  speciesIndex: number
}

type Props = {
  segments: Segment[]
  metalSymbol: string
  baseColor: string
}

export function PredominanceRow({ segments, metalSymbol, baseColor }: Props) {
  const xMin = -8
  const xMax = 0
  const bandHeight = 44
  const padLeft = 70
  const innerWidth = W - padLeft - 10
  const axisHeight = 22
  const footerHeight = 14
  const rowHeight = bandHeight + axisHeight + footerHeight
  const ticks = [-8, -6, -4, -2, 0]
  const palette = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"]

  const toX = (value: number) => padLeft + ((value - xMin) / (xMax - xMin)) * innerWidth

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-muted-foreground">
        <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: baseColor }} />
        {metalSymbol}
      </p>
      <svg viewBox={`0 0 ${W} ${rowHeight}`} className="w-full rounded border border-border/30 bg-card/40">
        {segments.map((segment, index) => {
          const x1 = toX(segment.x1)
          const x2 = toX(segment.x2)
          const width = Math.max(x2 - x1, 1)
          return (
            <g key={index}>
              <rect x={x1} y={0} width={width} height={bandHeight} fill={palette[segment.speciesIndex % palette.length]} fillOpacity={0.45} />
              {width > 48 && (
                <text x={(x1 + x2) / 2} y={bandHeight / 2 + 4} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.8} fontWeight={600}>
                  {segment.label}
                </text>
              )}
            </g>
          )
        })}
        {ticks.map((value) => (
          <g key={value}>
            <line x1={toX(value)} y1={bandHeight} x2={toX(value)} y2={bandHeight + 6} stroke="currentColor" strokeOpacity={0.3} />
            <text x={toX(value)} y={bandHeight + 16} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.45}>{value}</text>
          </g>
        ))}
        <text x={padLeft + innerWidth / 2} y={rowHeight - 4} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.38}>
          log[L′]
        </text>
      </svg>
    </div>
  )
}