import { H, IH, IW, PL, PT, W, mapX, mapY, type ConditionalCurve, type MetalLabel } from "@/features/advanced/complexation-explorer-shared"

type Props = {
  uid: string
  curves: ConditionalCurve[]
  currentPH: number
  metalLabels: MetalLabel[]
}

export function ConditionalChart({ uid, curves, currentPH, metalLabels }: Props) {
  const yMin = -5
  const yMax = 30
  const xMin = 0
  const xMax = 14
  const xTicks = [0, 2, 4, 6, 8, 10, 12, 14]
  const yTicks = [0, 5, 10, 15, 20, 25, 30]

  const mX = (value: number) => mapX(value, xMin, xMax)
  const mY = (value: number) => mapY(Math.max(yMin, Math.min(yMax, value)), yMin, yMax)

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded border border-border/30 bg-card/40">
        <defs>
          <clipPath id={`${uid}-cc`}>
            <rect x={PL} y={PT} width={IW} height={IH} />
          </clipPath>
        </defs>

        {yTicks.map((value) => (
          <g key={value}>
            <line x1={PL} y1={mY(value)} x2={PL + IW} y2={mY(value)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
            <text x={PL - 6} y={mY(value) + 4} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.45}>{value}</text>
          </g>
        ))}
        {xTicks.map((value) => (
          <g key={value}>
            <line x1={mX(value)} y1={PT} x2={mX(value)} y2={PT + IH} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
            <text x={mX(value)} y={PT + IH + 16} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.4}>{value}</text>
          </g>
        ))}

        <line x1={PL} y1={mY(8)} x2={PL + IW} y2={mY(8)} stroke="#d97706" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
        <text x={PL + IW + 4} y={mY(8) + 4} fontSize={9} fill="#d97706" opacity={0.7}>8</text>
        <line x1={mX(currentPH)} y1={PT} x2={mX(currentPH)} y2={PT + IH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,3" />

        <g clipPath={`url(#${uid}-cc)`}>
          {curves.map(({ pts, color }, index) => {
            const dPrime = pts.map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"}${mX(point.pH).toFixed(1)},${mY(point.logKfPrime).toFixed(1)}`).join(" ")
            const dDoublePrime = pts.map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"}${mX(point.pH).toFixed(1)},${mY(point.logKfDoublePrime).toFixed(1)}`).join(" ")
            return (
              <g key={index}>
                <path d={dPrime} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="4,2" strokeOpacity={0.72} />
                <path d={dDoublePrime} fill="none" stroke={color} strokeWidth={2.4} strokeOpacity={1} />
              </g>
            )
          })}
        </g>

        <text x={PL + IW / 2} y={H - 10} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.55}>pH</text>
        <text x={14} y={PT + IH / 2} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.55} transform={`rotate(-90, 14, ${PT + IH / 2})`}>
          log K
        </text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground">
        {metalLabels.map(({ symbol, color }) => (
          <div key={symbol} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-[2px] w-4" style={{ backgroundColor: color }} />
              <span className="font-mono text-foreground">{symbol}</span>
              <span>Kf″</span>
            </span>
            <span className="inline-flex items-center gap-1.5 opacity-70">
              <span className="inline-block h-[2px] w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
              <span>Kf′</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}