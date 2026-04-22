import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { exportCSV, downloadBlob } from "../engine/scenarios"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const FORMATS = [
  { id: "svg", label: "SVG" },
  { id: "csv", label: "CSV" },
  { id: "json", label: "JSON" },
]

const SAMPLE_CHART_DATA = {
  title: { es: "Especiación ácido acético", en: "Acetic acid speciation" },
  xLabel: "pH",
  yLabel: "α",
  notes: { es: "T=25°C, I≈0, modelo ideal", en: "T=25°C, I≈0, ideal model" },
  data: Array.from({ length: 15 }, (_, i) => {
    const pH = i
    const Ka = 1.74e-5
    const h = Math.pow(10, -pH)
    return { pH, alpha0: h / (h + Ka), alpha1: Ka / (h + Ka) }
  }),
}

function generateSVG(): string {
  const d = SAMPLE_CHART_DATA
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">
  <rect width="600" height="300" fill="white"/>
  <text x="300" y="20" text-anchor="middle" font-size="14">${d.title.es}</text>
  <text x="300" y="290" text-anchor="middle" font-size="10">${d.xLabel}</text>
  <text x="10" y="150" text-anchor="middle" font-size="10" transform="rotate(-90,10,150)">${d.yLabel}</text>
  ${d.data.map((p, i, arr) => i > 0 ? `<line x1="${50 + (arr[i-1].pH / 14) * 500}" y1="${260 - arr[i-1].alpha0 * 240}" x2="${50 + (p.pH / 14) * 500}" y2="${260 - p.alpha0 * 240}" stroke="blue" stroke-width="2"/>` : "").join("\n  ")}
  ${d.data.map((p, i, arr) => i > 0 ? `<line x1="${50 + (arr[i-1].pH / 14) * 500}" y1="${260 - arr[i-1].alpha1 * 240}" x2="${50 + (p.pH / 14) * 500}" y2="${260 - p.alpha1 * 240}" stroke="red" stroke-width="2"/>` : "").join("\n  ")}
  <text x="530" y="280" font-size="8" fill="gray">${d.notes.es}</text>
</svg>`
}

export function ReportExport({ locale }: Props) {
  const [format, setFormat] = useState("svg")
  const [exported, setExported] = useState(false)

  const handleExport = () => {
    const d = SAMPLE_CHART_DATA
    if (format === "csv") {
      const blob = exportCSV(["pH", "alpha0", "alpha1"], d.data.map((r) => [r.pH, r.alpha0.toFixed(6), r.alpha1.toFixed(6)]))
      downloadBlob(blob, "speciation.csv")
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify({ title: d.title[locale], notes: d.notes[locale], data: d.data }, null, 2)], { type: "application/json" })
      downloadBlob(blob, "speciation.json")
    } else {
      const blob = new Blob([generateSVG()], { type: "image/svg+xml" })
      downloadBlob(blob, "speciation.svg")
    }
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Salidas gráficas listas para informe: títulos, leyendas, unidades, notas técnicas. Formatos SVG, CSV, JSON."
          : "Report-ready graphic outputs: titles, legends, units, technical notes. SVG, CSV, JSON formats."}
      </p>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{SAMPLE_CHART_DATA.title[locale]}</div>
        <svg viewBox="0 0 480 200" className="w-full">
          {SAMPLE_CHART_DATA.data.map((p, i, arr) => i > 0 && (
            <g key={`l-${i}`}>
              <line x1={40 + (arr[i-1].pH / 14) * 420} y1={180 - arr[i-1].alpha0 * 160} x2={40 + (p.pH / 14) * 420} y2={180 - p.alpha0 * 160} stroke="#3b82f6" strokeWidth="1.5" />
              <line x1={40 + (arr[i-1].pH / 14) * 420} y1={180 - arr[i-1].alpha1 * 160} x2={40 + (p.pH / 14) * 420} y2={180 - p.alpha1 * 160} stroke="#ef4444" strokeWidth="1.5" />
            </g>
          ))}
          {[0, 7, 14].map((v) => <text key={v} x={40 + (v / 14) * 420} y={196} textAnchor="middle" className="fill-muted-foreground text-[8px]">{v}</text>)}
          <text x={240} y={12} textAnchor="middle" className="fill-muted-foreground text-[8px]">{SAMPLE_CHART_DATA.notes[locale]}</text>
        </svg>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> α₀ (HA)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> α₁ (A⁻)</span>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FORMATS.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleExport}>
          {locale === "es" ? "Exportar para informe" : "Export for report"}
        </Button>
        {exported && <span className="text-xs text-emerald-600">✓</span>}
      </div>
    </div>
  )
}
