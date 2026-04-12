import { formatComplexSpecies } from "@/features/advanced/complexation-math"
import { H, IH, IW, PL, PT, W, mapX, mapY, type AlphaSeriesPoint } from "@/features/advanced/complexation-explorer-shared"

type Props = {
  uid: string
  series: AlphaSeriesPoint[]
  nSpecies: number
  metalSymbol: string
  ligandAbbrev: string
  baseColor: string
}

export function AlphaChart({ uid, series, nSpecies, metalSymbol, ligandAbbrev, baseColor }: Props) {
  const xMin = -8
  const xMax = 0
  const yMin = 0
  const yMax = 1
  const xTicks = [-8, -6, -4, -2, 0]

  const mX = (value: number) => mapX(value, xMin, xMax)
  const mY = (value: number) => mapY(value, yMin, yMax)
  const speciesColors = Array.from({ length: nSpecies }, (_, index) => `hsl(${(30 + index * (330 / nSpecies)) % 360}, 70%, 55%)`)
  const paths = Array.from({ length: nSpecies }, (_, speciesIndex) => (
    series.map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"}${mX(point.logL).toFixed(1)},${mY(point.alphas[speciesIndex] ?? 0).toFixed(1)}`).join(" ")
  ))
  const speciesLabel = (index: number) => index === 0 ? metalSymbol : formatComplexSpecies(metalSymbol, ligandAbbrev, index)

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: baseColor }} />
        {metalSymbol} – {ligandAbbrev}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded border border-border/30 bg-card/40">
        <defs>
          <clipPath id={`${uid}-ac`}>
            <rect x={PL} y={PT} width={IW} height={IH} />
          </clipPath>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((value) => (
          <g key={value}>
            <line x1={PL} y1={mY(value)} x2={PL + IW} y2={mY(value)} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
            <text x={PL - 6} y={mY(value) + 4} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.38}>{value.toFixed(2)}</text>
          </g>
        ))}
        {xTicks.map((value) => (
          <g key={value}>
            <line x1={mX(value)} y1={PT} x2={mX(value)} y2={PT + IH} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
            <text x={mX(value)} y={PT + IH + 16} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.38}>{value}</text>
          </g>
        ))}

        <g clipPath={`url(#${uid}-ac)`}>
          {paths.map((path, index) => <path key={index} d={path} fill="none" stroke={speciesColors[index]} strokeWidth={2} />)}
        </g>

        <text x={PL + IW / 2} y={H - 10} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.46}>log[L′]</text>
        <text x={14} y={PT + IH / 2} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.46} transform={`rotate(-90, 14, ${PT + IH / 2})`}>
          α
        </text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground">
        {Array.from({ length: nSpecies }, (_, index) => (
          <div key={index} className="inline-flex items-center gap-2">
            <span className="inline-block h-[2px] w-4" style={{ backgroundColor: speciesColors[index] }} />
            <span className="font-mono text-foreground">{speciesLabel(index)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}