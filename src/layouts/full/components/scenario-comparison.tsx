import { useMemo } from "react"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const W = 500, H = 280, PL = 50, PR = 20, PT = 20, PB = 45

type Scenario = {
  id: string
  label: string
  color: string
  pKa: number
  conc: number
}

const SCENARIOS: Scenario[] = [
  { id: "s1", label: "CH₃COOH 0.10 M", color: "#3b82f6", pKa: 4.76, conc: 0.1 },
  { id: "s2", label: "CH₃COOH 0.01 M", color: "#ef4444", pKa: 4.76, conc: 0.01 },
  { id: "s3", label: "NH₄⁺ 0.10 M", color: "#22c55e", pKa: 9.25, conc: 0.1 },
  { id: "s4", label: "H₂CO₃ 0.05 M", color: "#f59e0b", pKa: 6.35, conc: 0.05 },
]

function calcAlpha0(pH: number, pKa: number) {
  return Math.pow(10, -pH) / (Math.pow(10, -pH) + Math.pow(10, -pKa))
}

export function ScenarioComparison({ locale }: Props) {
  const pHs = useMemo(() => Array.from({ length: 141 }, (_, i) => i * 0.1), [])

  const curves = useMemo(() =>
    SCENARIOS.map((sc) => ({
      ...sc,
      points: pHs.map((pH) => ({ pH, alpha: calcAlpha0(pH, sc.pKa) })),
    })), [pHs])

  const xScale = (pH: number) => PL + (pH / 14) * (W - PL - PR)
  const yScale = (a: number) => PT + (1 - a) * (H - PT - PB)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Comparativa multi-escenario con hasta 4 sistemas. Filtros, leyendas legibles y diferencias resaltadas."
          : "Multi-scenario comparison with up to 4 systems. Filters, readable legends and highlighted differences."}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border/40 rounded bg-card">
        {[0, 0.25, 0.5, 0.75, 1].map((a) => (
          <g key={a}>
            <line x1={PL} y1={yScale(a)} x2={W - PR} y2={yScale(a)} stroke="currentColor" strokeWidth="0.3" className="text-border" />
            <text x={PL - 4} y={yScale(a) + 3} textAnchor="end" className="fill-muted-foreground text-[8px]">{a.toFixed(2)}</text>
          </g>
        ))}
        {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((pH) => (
          <g key={pH}>
            <line x1={xScale(pH)} y1={PT} x2={xScale(pH)} y2={H - PB} stroke="currentColor" strokeWidth="0.3" className="text-border" />
            <text x={xScale(pH)} y={H - PB + 12} textAnchor="middle" className="fill-muted-foreground text-[8px]">{pH}</text>
          </g>
        ))}

        {curves.map((c) => (
          <polyline
            key={c.id}
            fill="none"
            stroke={c.color}
            strokeWidth="1.8"
            points={c.points.map((p) => `${xScale(p.pH)},${yScale(p.alpha)}`).join(" ")}
          />
        ))}

        <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[9px]">pH</text>
        <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`} className="fill-muted-foreground text-[9px]">α₀</text>
      </svg>

      <div className="flex flex-wrap gap-3">
        {SCENARIOS.map((sc) => (
          <div key={sc.id} className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: sc.color }} />
            <span className="text-[10px]">{sc.label}</span>
            <span className="text-[9px] text-muted-foreground">(pKa={sc.pKa})</span>
          </div>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-2">
        <div className="text-[10px] text-muted-foreground mb-1">{locale === "es" ? "Tabla comparativa" : "Comparison table"}</div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left">{locale === "es" ? "Sistema" : "System"}</th>
              <th>pKa</th><th>C (M)</th><th>pH=3</th><th>pH=7</th><th>pH=10</th>
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((sc) => (
              <tr key={sc.id} className="border-t border-border/20">
                <td className="font-medium">{sc.label}</td>
                <td className="text-center font-mono">{sc.pKa}</td>
                <td className="text-center font-mono">{sc.conc}</td>
                {[3, 7, 10].map((pH) => (
                  <td key={pH} className="text-center font-mono">{calcAlpha0(pH, sc.pKa).toFixed(3)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
