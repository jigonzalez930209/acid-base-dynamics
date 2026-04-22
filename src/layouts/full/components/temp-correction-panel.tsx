import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { MathExpression } from "@/components/shared/math-expression"
import { correctPKForTemperature, pKwAtTemp, buildPKvsTempCurve, DELTA_H_DEFAULTS } from "../engine/temperature"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function TempCorrectionPanel({ locale }: Props) {
  const [temp, setTemp] = useState(25)
  const [selectedSystem, setSelectedSystem] = useState(0)

  const systems = Object.entries(DELTA_H_DEFAULTS)
  const [sysKey, deltaH] = systems[selectedSystem]

  const refPK = sysKey === "water" ? 14.0 : sysKey === "acetic" ? 4.76 : sysKey === "carbonic_1" ? 6.35 : sysKey === "carbonic_2" ? 10.33 : sysKey === "phosphoric_1" ? 2.16 : 9.25
  const corrected = correctPKForTemperature(refPK, temp, deltaH)
  const pKw = pKwAtTemp(temp)
  const curve = buildPKvsTempCurve(refPK, deltaH, 0, 80, 5)

  const isEstimated = Math.abs(temp - 25) > 20

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Corrección de constantes por temperatura (Van't Hoff). Diferencia dato tabulado de dato estimado y marca incertidumbre."
          : "Temperature correction of constants (Van't Hoff). Differentiates tabulated from estimated data and flags uncertainty."}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {systems.map(([key], i) => (
          <button
            key={key}
            onClick={() => setSelectedSystem(i)}
            className={`rounded px-2 py-1 text-xs ${i === selectedSystem ? "bg-primary text-primary-foreground" : "bg-muted/40 text-foreground hover:bg-muted"}`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground">
          T = {temp} °C {isEstimated && (locale === "es" ? "(⚠ estimado)" : "(⚠ estimated)")}
        </label>
        <Slider min={0} max={100} step={1} value={[temp]} onValueChange={([v]) => setTemp(v)} />
      </div>

      <MathExpression
        math={String.raw`\text{p}K(T) = \text{p}K(T_{\text{ref}}) + \frac{\Delta H}{2.303R}\left(\frac{1}{T} - \frac{1}{T_{\text{ref}}}\right)`}
        block
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">pK (25°C)</div>
          <div className="text-xs font-mono font-bold">{refPK.toFixed(2)}</div>
          <div className="text-[8px] text-emerald-600">{locale === "es" ? "tabulado" : "tabulated"}</div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">pK ({temp}°C)</div>
          <div className="text-xs font-mono font-bold">{corrected.correctedPK.toFixed(3)}</div>
          <div className={`text-[8px] ${isEstimated ? "text-amber-600" : "text-emerald-600"}`}>
            {isEstimated ? (locale === "es" ? "estimado" : "estimated") : (locale === "es" ? "interpolado" : "interpolated")}
          </div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">ΔH (kJ/mol)</div>
          <div className="text-xs font-mono font-bold">{deltaH.toFixed(1)}</div>
        </div>
        <div className="rounded bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">pKw ({temp}°C)</div>
          <div className="text-xs font-mono font-bold">{pKw.toFixed(3)}</div>
        </div>
      </div>

      <div className="rounded border border-border/40 bg-card p-2">
        <div className="text-[10px] text-muted-foreground mb-1">{locale === "es" ? "Curva pK vs T:" : "pK vs T curve:"}</div>
        <svg viewBox="0 0 400 120" className="w-full h-24">
          {curve.map((pt, i, arr) => i > 0 && (
            <line
              key={i}
              x1={(arr[i - 1].temp / 80) * 380 + 10}
              y1={110 - ((arr[i - 1].pK - Math.min(...arr.map((a) => a.pK))) / (Math.max(...arr.map((a) => a.pK)) - Math.min(...arr.map((a) => a.pK)) + 0.01)) * 100}
              x2={(pt.temp / 80) * 380 + 10}
              y2={110 - ((pt.pK - Math.min(...arr.map((a) => a.pK))) / (Math.max(...arr.map((a) => a.pK)) - Math.min(...arr.map((a) => a.pK)) + 0.01)) * 100}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary"
            />
          ))}
          <circle cx={(temp / 80) * 380 + 10} cy={110 - ((corrected.correctedPK - Math.min(...curve.map((a) => a.pK))) / (Math.max(...curve.map((a) => a.pK)) - Math.min(...curve.map((a) => a.pK)) + 0.01)) * 100} r="3" className="fill-red-500" />
        </svg>
      </div>
    </div>
  )
}
