import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { HYDROXIDE_DATA } from "@/features/advanced/precipitation-data"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

function calcPrecipitationPH(Ksp: number, n: number, metalConc: number) {
  const C = Math.max(metalConc, 1e-15)
  const OH_start    = Math.pow(Ksp / C,         1 / n)
  const OH_complete = Math.pow(Ksp / (0.001 * C), 1 / n)
  return {
    pHStart:    Math.min(14, Math.max(0, 14 + Math.log10(OH_start))),
    pHComplete: Math.min(14, Math.max(0, 14 + Math.log10(OH_complete))),
  }
}

export function PrecipitationPanel({ locale }: Props) {
  const { t } = useTranslation()
  const [compId,  setCompId]  = useState("fe-oh3")
  const [logConc, setLogConc] = useState(-2)   // log(0.01) = -2

  const compound  = HYDROXIDE_DATA.find((h) => h.id === compId) ?? HYDROXIDE_DATA[0]
  const metalConc = 10 ** logConc
  const { pHStart, pHComplete } = calcPrecipitationPH(compound.Ksp, compound.n, metalConc)
  const zone = pHComplete - pHStart

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.precipitation.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("advanced.precipitation.description")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{t("advanced.precipitation.compound")}</p>
          <Select value={compId} onValueChange={setCompId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {HYDROXIDE_DATA.map((h) => (
                <SelectItem key={h.id} value={h.id} className="text-xs">{h.label[locale]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("advanced.precipitation.concentration")}</span>
            <span className="font-mono text-foreground">{metalConc.toExponential(2)} mol/L</span>
          </div>
          <Slider min={-5} max={0} step={0.5} value={[logConc]}
            onValueChange={([v]: number[]) => setLogConc(v)} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>10⁻⁵ M</span><span>1 M</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border/50 bg-muted/30 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground">{t("advanced.precipitation.pHStart")}</p>
            <p className="font-mono text-xl font-medium text-amber-600 dark:text-amber-400">{pHStart.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t("advanced.precipitation.pHComplete")}</p>
            <p className="font-mono text-xl font-medium text-emerald-600 dark:text-emerald-400">{pHComplete.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground">Zona de precipitación  (pH 0 – 14)</p>
          <div className="relative h-3.5 overflow-hidden rounded-sm bg-muted">
            <div className="absolute h-full rounded-sm bg-amber-500/70"
              style={{ left: `${(pHStart / 14) * 100}%`, width: `${Math.max((zone / 14) * 100, 0.8)}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>0</span><span>7</span><span>14</span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground font-mono">
          Ksp = {compound.Ksp.toExponential(2)}  ·  {compound.formula}
        </p>
      </div>
    </div>
  )
}
