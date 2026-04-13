import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type Interference = {
  analyte: string
  interferent: string
  effect: { es: string; en: string }
  threshold: number
  mitigation: { es: string; en: string }
}

const INTERFERENCES: Interference[] = [
  { analyte: "Ca²⁺ (EDTA)", interferent: "Mg²⁺", effect: { es: "Co-titula con EDTA", en: "Co-titrates with EDTA" }, threshold: 0.01, mitigation: { es: "Usar Eriochrome T, pH>10", en: "Use Eriochrome T, pH>10" } },
  { analyte: "Ca²⁺ (EDTA)", interferent: "Fe³⁺", effect: { es: "Compite fuertemente", en: "Competes strongly" }, threshold: 0.001, mitigation: { es: "Enmascarar con CN⁻ o reducir a Fe²⁺", en: "Mask with CN⁻ or reduce to Fe²⁺" } },
  { analyte: "Ca²⁺ (EDTA)", interferent: "Cu²⁺", effect: { es: "Bloquea indicador", en: "Blocks indicator" }, threshold: 0.001, mitigation: { es: "Enmascarar con tiosulfato", en: "Mask with thiosulfate" } },
  { analyte: "CH₃COOH", interferent: "H₃PO₄", effect: { es: "Titula simultáneamente", en: "Titrates simultaneously" }, threshold: 0.005, mitigation: { es: "Separar pKa o usar potenciometría", en: "Separate pKa or use potentiometry" } },
  { analyte: "CH₃COOH", interferent: "CO₂", effect: { es: "Buffer carbonato falso", en: "False carbonate buffer" }, threshold: 0.001, mitigation: { es: "Hervir y enfriar antes", en: "Boil and cool before" } },
  { analyte: "Fe²⁺ (redox)", interferent: "Cr³⁺", effect: { es: "Oxidación simultánea", en: "Simultaneous oxidation" }, threshold: 0.01, mitigation: { es: "Ajustar potencial con H₃PO₄", en: "Adjust potential with H₃PO₄" } },
]

function severityAtConc(conc: number, threshold: number): "none" | "low" | "moderate" | "high" {
  if (conc < threshold * 0.1) return "none"
  if (conc < threshold) return "low"
  if (conc < threshold * 10) return "moderate"
  return "high"
}

const SEV_COLORS = { none: "bg-emerald-500/10 text-emerald-600", low: "bg-blue-500/10 text-blue-600", moderate: "bg-amber-500/10 text-amber-600", high: "bg-red-500/10 text-red-600" }

export function InterferencePanel({ locale }: Props) {
  const [analyteIdx, setAnalyteIdx] = useState(0)
  const [interfConc, setInterfConc] = useState(-3)

  const analytes = [...new Set(INTERFERENCES.map((i) => i.analyte))]
  const filtered = INTERFERENCES.filter((i) => i.analyte === analytes[analyteIdx])
  const conc = Math.pow(10, interfConc)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Evaluación de interferencias: especies competitivas, efectos de complejantes, precipitados indeseados y ventanas de selectividad."
          : "Interference evaluation: competing species, complexant effects, unwanted precipitates and selectivity windows."}
      </p>

      <div className="flex flex-wrap gap-2 items-end">
        <Select value={String(analyteIdx)} onValueChange={(v) => setAnalyteIdx(Number(v))}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {analytes.map((a, i) => <SelectItem key={i} value={String(i)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="space-y-0.5 flex-1 min-w-32">
          <label className="text-[9px] text-muted-foreground">
            [Interf.] = 10^{interfConc.toFixed(1)} = {conc.toExponential(1)} M
          </label>
          <Slider min={-6} max={0} step={0.1} value={[interfConc]} onValueChange={([v]) => setInterfConc(v)} />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((intrf, i) => {
          const sev = severityAtConc(conc, intrf.threshold)
          return (
            <div key={i} className="rounded border border-border/40 bg-card p-2.5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">{intrf.interferent}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase ${SEV_COLORS[sev]}`}>{sev}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{intrf.effect[locale]}</div>
              <div className="flex justify-between text-[10px]">
                <span>{locale === "es" ? "Umbral" : "Threshold"}: {intrf.threshold.toExponential(0)} M</span>
                <span>{locale === "es" ? "Actual" : "Current"}: {conc.toExponential(1)} M</span>
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400">
                💡 {intrf.mitigation[locale]}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded bg-muted/20 p-2 text-[10px] text-muted-foreground">
        {locale === "es"
          ? "La severidad depende de la concentración relativa al umbral: none (<0.1×), low (<1×), moderate (<10×), high (>10×)."
          : "Severity depends on concentration relative to threshold: none (<0.1×), low (<1×), moderate (<10×), high (>10×)."}
      </div>
    </div>
  )
}
