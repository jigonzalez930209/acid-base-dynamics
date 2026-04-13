import { useState, useMemo } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const W = 480, H = 320, P = 40

type SystemDef = {
  label: string
  xAxis: string
  yAxis: string
  regions: { label: string; color: string; test: (x: number, y: number) => boolean }[]
}

const SYSTEMS: SystemDef[] = [
  {
    label: "H₂CO₃ (pH vs logCT)",
    xAxis: "pH",
    yAxis: "log C_T",
    regions: [
      { label: "H₂CO₃", color: "#ef4444", test: (pH) => pH < 6.35 },
      { label: "HCO₃⁻", color: "#3b82f6", test: (pH) => pH >= 6.35 && pH < 10.33 },
      { label: "CO₃²⁻", color: "#8b5cf6", test: (pH) => pH >= 10.33 },
    ],
  },
  {
    label: "H₃PO₄ (pH vs logCT)",
    xAxis: "pH",
    yAxis: "log C_T",
    regions: [
      { label: "H₃PO₄", color: "#f97316", test: (pH) => pH < 2.16 },
      { label: "H₂PO₄⁻", color: "#22c55e", test: (pH) => pH >= 2.16 && pH < 7.21 },
      { label: "HPO₄²⁻", color: "#06b6d4", test: (pH) => pH >= 7.21 && pH < 12.32 },
      { label: "PO₄³⁻", color: "#a855f7", test: (pH) => pH >= 12.32 },
    ],
  },
]

export function PredominanceMap2D({ locale }: Props) {
  const [sysIdx, setSysIdx] = useState(0)
  const [resolution, setResolution] = useState(40)
  const sys = SYSTEMS[sysIdx]

  const pixels = useMemo(() => {
    const result: { x: number; y: number; w: number; h: number; color: string }[] = []
    const dx = (W - 2 * P) / resolution
    const dy = (H - 2 * P) / resolution
    for (let ix = 0; ix < resolution; ix++) {
      for (let iy = 0; iy < resolution; iy++) {
        const xVal = (ix / resolution) * 14
        const yVal = -6 + (iy / resolution) * 6
        const region = sys.regions.find((r) => r.test(xVal, yVal))
        if (region) result.push({ x: P + ix * dx, y: P + iy * dy, w: dx + 0.5, h: dy + 0.5, color: region.color })
      }
    }
    return result
  }, [sys, resolution])

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Mapas de predominio 2D con ejes configurables: pH, pL, potencial, concentración o temperatura."
          : "2D predominance maps with configurable axes: pH, pL, potential, concentration or temperature."}
      </p>

      <div className="flex flex-wrap gap-2 items-end">
        <Select value={String(sysIdx)} onValueChange={(v) => setSysIdx(Number(v))}>
          <SelectTrigger className="w-52 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SYSTEMS.map((s, i) => <SelectItem key={i} value={String(i)}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="space-y-0.5 flex-1 min-w-32">
          <label className="text-[9px] text-muted-foreground">{locale === "es" ? "Resolución" : "Resolution"}: {resolution}</label>
          <Slider min={10} max={80} step={5} value={[resolution]} onValueChange={([v]) => setResolution(v)} />
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border/40 rounded bg-card">
        {pixels.map((px, i) => <rect key={i} x={px.x} y={px.y} width={px.w} height={px.h} fill={px.color} opacity={0.6} />)}
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="currentColor" strokeWidth="1" className="text-foreground" />
        <line x1={P} y1={P} x2={P} y2={H - P} stroke="currentColor" strokeWidth="1" className="text-foreground" />
        <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">{sys.xAxis}</text>
        <text x={12} y={H / 2} textAnchor="middle" transform={`rotate(-90, 12, ${H / 2})`} className="fill-muted-foreground text-[10px]">{sys.yAxis}</text>
        {[0, 2, 4, 7, 10, 14].map((v) => (
          <text key={v} x={P + (v / 14) * (W - 2 * P)} y={H - P + 14} textAnchor="middle" className="fill-muted-foreground text-[8px]">{v}</text>
        ))}
      </svg>

      <div className="flex flex-wrap gap-2">
        {sys.regions.map((r) => (
          <div key={r.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: r.color, opacity: 0.6 }} />
            <span className="text-[10px]">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
