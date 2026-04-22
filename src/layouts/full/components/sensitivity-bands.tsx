import { useState, useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const W = 500, H = 240, PL = 50, PR = 20, PT = 20, PB = 40

type Param = { id: string; label: string; base: number; min: number; max: number; step: number; unit: string }

const PARAMS: Param[] = [
  { id: "pKa", label: "pKa", base: 4.76, min: 3, max: 7, step: 0.1, unit: "" },
  { id: "conc", label: "C (M)", base: 0.1, min: 0.001, max: 1, step: 0.001, unit: "M" },
  { id: "temp", label: "T (°C)", base: 25, min: 5, max: 80, step: 1, unit: "°C" },
]

function calcPH(pKa: number, c: number): number {
  const Ka = Math.pow(10, -pKa)
  const h = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * c)) / 2
  return -Math.log10(Math.max(h, 1e-15))
}

export function SensitivityBands({ locale }: Props) {
  const [paramIdx, setParamIdx] = useState(0)
  const [spread, setSpread] = useState(20)
  const param = PARAMS[paramIdx]

  const baseConc = 0.1
  const basePKa = 4.76

  const data = useMemo(() => {
    const steps = 80
    const result: { x: number; mid: number; lo: number; hi: number }[] = []
    const frac = spread / 100

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const xVal = param.min + t * (param.max - param.min)

      let midPH: number, loPH: number, hiPH: number
      if (param.id === "pKa") {
        midPH = calcPH(xVal, baseConc)
        loPH = calcPH(xVal * (1 + frac), baseConc)
        hiPH = calcPH(xVal * (1 - frac), baseConc)
      } else if (param.id === "conc") {
        midPH = calcPH(basePKa, xVal)
        loPH = calcPH(basePKa, xVal * (1 + frac))
        hiPH = calcPH(basePKa, xVal * (1 - frac))
      } else {
        const deltaH = -0.4
        const corrPK = basePKa + deltaH * (1 / (273.15 + xVal) - 1 / 298.15) / (2.303 * 8.314e-3)
        midPH = calcPH(corrPK, baseConc)
        loPH = calcPH(corrPK * (1 + frac), baseConc)
        hiPH = calcPH(corrPK * (1 - frac), baseConc)
      }

      result.push({ x: xVal, mid: midPH, lo: Math.min(loPH, hiPH), hi: Math.max(loPH, hiPH) })
    }
    return result
  }, [param, spread])

  const minY = Math.min(...data.map((d) => d.lo)) - 0.3
  const maxY = Math.max(...data.map((d) => d.hi)) + 0.3
  const xScale = (x: number) => PL + ((x - param.min) / (param.max - param.min)) * (W - PL - PR)
  const yScale = (y: number) => PT + ((maxY - y) / (maxY - minY)) * (H - PT - PB)

  const bandPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.x)},${yScale(d.hi)}`).join(" ") + data.slice().reverse().map((d) => `L${xScale(d.x)},${yScale(d.lo)}`).join(" ") + "Z"

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Análisis de sensibilidad: barre cada parámetro crítico y muestra bandas de incertidumbre con escenarios extremos."
          : "Sensitivity analysis: sweep each critical parameter and show uncertainty bands with extreme scenarios."}
      </p>

      <div className="flex flex-wrap gap-3 items-end">
        <Select value={String(paramIdx)} onValueChange={(v) => setParamIdx(Number(v))}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PARAMS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="space-y-0.5 flex-1 min-w-32">
          <label className="text-[9px] text-muted-foreground">±{spread}%</label>
          <Slider min={5} max={50} step={1} value={[spread]} onValueChange={([v]) => setSpread(v)} />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border/40 rounded bg-card">
        <path d={bandPath} fill="currentColor" className="text-primary/15" />
        <polyline fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" points={data.map((d) => `${xScale(d.x)},${yScale(d.mid)}`).join(" ")} />
        <polyline fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" className="text-muted-foreground" points={data.map((d) => `${xScale(d.x)},${yScale(d.hi)}`).join(" ")} />
        <polyline fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" className="text-muted-foreground" points={data.map((d) => `${xScale(d.x)},${yScale(d.lo)}`).join(" ")} />
        <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[9px]">{param.label}</text>
        <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`} className="fill-muted-foreground text-[9px]">pH</text>
      </svg>

      <div className="flex gap-3 text-[10px]">
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-primary rounded" /><span>{locale === "es" ? "Central" : "Central"}</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-muted-foreground rounded" style={{ borderTop: "1px dashed" }} /><span>±{spread}%</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/15" /><span>{locale === "es" ? "Banda" : "Band"}</span></div>
      </div>
    </div>
  )
}
