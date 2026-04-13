import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { MathExpression } from "@/components/shared/math-expression"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const W = 480, H = 220, PL = 50, PR = 20, PT = 20, PB = 40

export function TitrationPlanner({ locale }: Props) {
  const [cAnalyte, setCAnalyte] = useState(0.1)
  const [cTitrant, setCTitrant] = useState(0.1)
  const [vAnalyte, setVAnalyte] = useState(25)
  const pKa = 4.76

  const vEq = (cAnalyte * vAnalyte) / cTitrant
  const vMax = vEq * 2

  const points = Array.from({ length: 100 }, (_, i) => {
    const vb = (i / 99) * vMax
    const totalV = vAnalyte + vb
    const nHA = cAnalyte * vAnalyte - cTitrant * vb
    const nA = cTitrant * vb

    let pH: number
    if (vb < vEq * 0.001) {
      pH = 0.5 * (pKa - Math.log10(cAnalyte))
    } else if (vb < vEq * 0.999) {
      pH = pKa + Math.log10(nA / Math.max(nHA, 1e-15))
    } else if (vb < vEq * 1.001) {
      pH = 7 + 0.5 * pKa + 0.5 * Math.log10(cAnalyte * vAnalyte / totalV)
    } else {
      const excessOH = (cTitrant * vb - cAnalyte * vAnalyte) / totalV
      pH = 14 + Math.log10(Math.max(excessOH, 1e-15))
    }
    return { vb, pH: Math.max(0, Math.min(14, pH)) }
  })

  const xScale = (v: number) => PL + (v / vMax) * (W - PL - PR)
  const yScale = (pH: number) => PT + ((14 - pH) / 14) * (H - PT - PB)

  const indicatorPH = 7 + 0.5 * pKa + 0.5 * Math.log10(cAnalyte * vAnalyte / (vAnalyte + vEq))
  const indicatorRange: [number, number] = [indicatorPH - 1, indicatorPH + 1]

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Planificación de titulaciones: volumen equivalente, rango de indicador, concentración óptima y puntos críticos."
          : "Titration planning: equivalence volume, indicator range, optimal concentration and critical points."}
      </p>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-0.5 min-w-28">
          <label className="text-[9px] text-muted-foreground">C_a = {cAnalyte.toFixed(3)} M</label>
          <Slider min={0.01} max={0.5} step={0.005} value={[cAnalyte]} onValueChange={([v]) => setCAnalyte(v)} />
        </div>
        <div className="space-y-0.5 min-w-28">
          <label className="text-[9px] text-muted-foreground">C_b = {cTitrant.toFixed(3)} M</label>
          <Slider min={0.01} max={0.5} step={0.005} value={[cTitrant]} onValueChange={([v]) => setCTitrant(v)} />
        </div>
        <div className="space-y-0.5 min-w-20">
          <label className="text-[9px] text-muted-foreground">V₀ = {vAnalyte} mL</label>
          <Slider min={10} max={100} step={5} value={[vAnalyte]} onValueChange={([v]) => setVAnalyte(v)} />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border/40 rounded bg-card">
        <rect x={xScale(0)} y={yScale(indicatorRange[1])} width={W - PL - PR} height={yScale(indicatorRange[0]) - yScale(indicatorRange[1])} fill="#22c55e" opacity={0.1} />
        <polyline fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" points={points.map((p) => `${xScale(p.vb)},${yScale(p.pH)}`).join(" ")} />
        <line x1={xScale(vEq)} y1={PT} x2={xScale(vEq)} y2={H - PB} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3" />
        <circle cx={xScale(vEq)} cy={yScale(indicatorPH)} r="3" className="fill-red-500" />
        <text x={xScale(vEq) + 4} y={yScale(indicatorPH) - 4} className="fill-red-500 text-[7px]">V_eq={vEq.toFixed(1)}</text>
        <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[9px]">V_b (mL)</text>
        <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`} className="fill-muted-foreground text-[9px]">pH</text>
        {[0, 2, 4, 7, 10, 14].map((v) => <text key={v} x={PL - 4} y={yScale(v) + 3} textAnchor="end" className="fill-muted-foreground text-[7px]">{v}</text>)}
      </svg>

      <MathExpression math={String.raw`V_{eq} = \frac{C_a \cdot V_0}{C_b} = \frac{${cAnalyte} \times ${vAnalyte}}{${cTitrant}} = ${vEq.toFixed(2)}\,\text{mL}`} block />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">V_eq</div>
          <div className="text-xs font-mono font-bold">{vEq.toFixed(2)} mL</div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">pH_eq</div>
          <div className="text-xs font-mono font-bold">{indicatorPH.toFixed(2)}</div>
        </div>
        <div className="rounded bg-emerald-500/10 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Ind. rango" : "Ind. range"}</div>
          <div className="text-xs font-mono font-bold">{indicatorRange[0].toFixed(1)}–{indicatorRange[1].toFixed(1)}</div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Bureta" : "Burette"}</div>
          <div className="text-xs font-mono font-bold">{vEq < 50 ? "50 mL" : "100 mL"}</div>
        </div>
      </div>
    </div>
  )
}
