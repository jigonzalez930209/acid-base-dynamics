import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MathExpression } from "@/components/shared/math-expression"
import { calcIonicStrength, activityCoefficient, ACTIVITY_MODEL_LABELS } from "../engine/activity"
import type { ActivityModel } from "../engine/types"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TEST_IONS = [
  { label: "H⁺", charge: 1 },
  { label: "Na⁺", charge: 1 },
  { label: "Ca²⁺", charge: 2 },
  { label: "Fe³⁺", charge: 3 },
  { label: "Al³⁺", charge: 3 },
  { label: "SO₄²⁻", charge: -2 },
  { label: "PO₄³⁻", charge: -3 },
]

const MODELS: ActivityModel[] = ["ideal", "debye_huckel_limiting", "debye_huckel_extended", "davies"]

export function ActivityPanel({ locale }: Props) {
  const [ionicStrength, setIonicStrength] = useState(0.01)
  const [selectedIon, setSelectedIon] = useState(0)

  const ion = TEST_IONS[selectedIon]
  const I = ionicStrength

  const results = MODELS.map((m) => ({
    model: m,
    label: ACTIVITY_MODEL_LABELS[m],
    gamma: activityCoefficient(Math.abs(ion.charge), I, m),
  }))

  const ionic = calcIonicStrength([
    { charge: 1, concentration: ionicStrength },
    { charge: -1, concentration: ionicStrength },
  ])

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Correcciones por actividad y fuerza iónica: modelos aproximados para laboratorio docente con ruta extensible."
          : "Activity and ionic strength corrections: approximate models for teaching lab with extensible path."}
      </p>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">{locale === "es" ? "Ion" : "Ion"}</label>
          <Select value={String(selectedIon)} onValueChange={(v) => setSelectedIon(Number(v))}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TEST_IONS.map((t, i) => <SelectItem key={i} value={String(i)}>{t.label} (z={Math.abs(t.charge)})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 flex-1 min-w-48">
          <label className="text-[10px] text-muted-foreground">
            I = {I.toFixed(4)} M
          </label>
          <Slider min={0.001} max={0.5} step={0.001} value={[ionicStrength]} onValueChange={([v]) => setIonicStrength(v)} />
        </div>
      </div>

      <MathExpression math={String.raw`I = \frac{1}{2}\sum c_i z_i^2 = ${ionic.toFixed(4)}\,\text{M}`} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {results.map((r) => (
          <div key={r.model} className="rounded border border-border/40 bg-card p-2 text-center space-y-1">
            <div className="text-[9px] text-muted-foreground">{r.label[locale]}</div>
            <div className="text-sm font-mono font-bold">{r.gamma.toFixed(4)}</div>
            <div className="text-[9px] text-muted-foreground">
              log γ = {Math.log10(r.gamma).toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded bg-blue-500/10 p-2">
        <MathExpression math={String.raw`\log\gamma_{\pm} = -A z^2 \frac{\sqrt{I}}{1 + B a \sqrt{I}} \quad (A=0.509,\,B=0.328,\,a\approx 3\text{Å})`} />
      </div>

      <div className="text-[10px] text-muted-foreground">
        {locale === "es"
          ? "⚠ Debye-Hückel es válido para I < 0.1 M. Davies extiende hasta ~0.5 M con menor precisión."
          : "⚠ Debye-Hückel is valid for I < 0.1 M. Davies extends up to ~0.5 M with reduced accuracy."}
      </div>
    </div>
  )
}
