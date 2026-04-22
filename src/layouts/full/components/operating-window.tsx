import { useMemo } from "react"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const W = 500, H = 220, PL = 50, PR = 20, PT = 20, PB = 40

type Window = { xMin: number; xMax: number; label: { es: string; en: string }; color: string; type: "optimal" | "caution" | "danger" }

const WINDOWS: Window[] = [
  { xMin: 0, xMax: 2.5, label: { es: "Zona ácida extrema", en: "Extreme acid zone" }, color: "#ef4444", type: "danger" },
  { xMin: 2.5, xMax: 4, label: { es: "Titulación ácida viable", en: "Viable acid titration" }, color: "#f59e0b", type: "caution" },
  { xMin: 4, xMax: 5.5, label: { es: "Zona óptima buffer", en: "Optimal buffer zone" }, color: "#22c55e", type: "optimal" },
  { xMin: 5.5, xMax: 8, label: { es: "Zona neutra", en: "Neutral zone" }, color: "#3b82f6", type: "caution" },
  { xMin: 8, xMax: 10.5, label: { es: "Buffer NH₃/NH₄⁺", en: "NH₃/NH₄⁺ buffer" }, color: "#22c55e", type: "optimal" },
  { xMin: 10.5, xMax: 12, label: { es: "Titulación básica", en: "Basic titration" }, color: "#f59e0b", type: "caution" },
  { xMin: 12, xMax: 14, label: { es: "Zona básica extrema", en: "Extreme basic zone" }, color: "#ef4444", type: "danger" },
]

function bufferCapacity(pH: number, pKa: number, C: number): number {
  const h = Math.pow(10, -pH)
  const Ka = Math.pow(10, -pKa)
  const alpha = Ka / (h + Ka)
  return 2.303 * C * alpha * (1 - alpha)
}

export function OperatingWindow({ locale }: Props) {
  const pKa = 4.76, C = 0.1

  const data = useMemo(() => Array.from({ length: 141 }, (_, i) => {
    const pH = i * 0.1
    return { pH, beta: bufferCapacity(pH, pKa, C) }
  }), [])

  const maxBeta = Math.max(...data.map((d) => d.beta))
  const xScale = (pH: number) => PL + (pH / 14) * (W - PL - PR)
  const yScale = (b: number) => PT + (1 - b / (maxBeta * 1.1)) * (H - PT - PB)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Ventanas operativas: zonas recomendadas, límites por interferencias, umbrales de titulación y regiones donde el método pierde robustez."
          : "Operating windows: recommended zones, interference limits, titration thresholds and regions where the method loses robustness."}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border/40 rounded bg-card">
        {WINDOWS.map((w) => (
          <rect key={w.xMin} x={xScale(w.xMin)} y={PT} width={xScale(w.xMax) - xScale(w.xMin)} height={H - PT - PB} fill={w.color} opacity={0.12} />
        ))}

        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
          points={data.map((d) => `${xScale(d.pH)},${yScale(d.beta)}`).join(" ")}
        />

        <line x1={xScale(pKa)} y1={PT} x2={xScale(pKa)} y2={H - PB} stroke="currentColor" strokeWidth="0.8" strokeDasharray="4,3" className="text-foreground" />
        <text x={xScale(pKa) + 3} y={PT + 12} className="fill-foreground text-[8px]">pKa={pKa}</text>

        <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[9px]">pH</text>
        <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`} className="fill-muted-foreground text-[9px]">β</text>

        {[0, 2, 4, 7, 10, 14].map((v) => (
          <text key={v} x={xScale(v)} y={H - PB + 12} textAnchor="middle" className="fill-muted-foreground text-[8px]">{v}</text>
        ))}
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {WINDOWS.map((w) => (
          <div key={w.xMin} className="flex items-center gap-1.5 rounded border border-border/30 px-1.5 py-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: w.color, opacity: 0.5 }} />
            <div>
              <div className="text-[9px] font-medium">{w.label[locale]}</div>
              <div className="text-[8px] text-muted-foreground">pH {w.xMin}–{w.xMax}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded bg-emerald-500/10 p-2 text-[10px] text-emerald-700 dark:text-emerald-400">
        {locale === "es"
          ? "✓ Zona óptima de trabajo: pH 4.0–5.5 (buffer acético, β máxima en pKa=4.76)"
          : "✓ Optimal working zone: pH 4.0–5.5 (acetate buffer, maximum β at pKa=4.76)"}
      </div>
    </div>
  )
}
