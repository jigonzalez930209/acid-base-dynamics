import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { ComplexationPanelSparkline } from "@/features/advanced/complexation-panel-sparkline"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  METAL_EDTA,
  AMMONIA_COMPLEXES,
  calcAlphaY4,
  calcLogKfPrime,
  calcLogKfDoublePrime,
  minTitrationPH,
} from "@/features/advanced/complexation-data"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

// Colour band for log Kf'' quality
function kfColor(logK: number): string {
  if (logK >= 12) return "text-emerald-600 dark:text-emerald-400"
  if (logK >= 8)  return "text-amber-600 dark:text-amber-400"
  if (logK >= 4)  return "text-orange-600 dark:text-orange-400"
  return "text-rose-600 dark:text-rose-400"
}

export function ComplexationPanel({ locale }: Props) {
  const { t } = useTranslation()
  const [pH, setPH] = useState(10)

  const alphaY4     = useMemo(() => calcAlphaY4(pH), [pH])
  const logAlphaY4  = Math.log10(alphaY4)

  const rows = useMemo(
    () =>
      METAL_EDTA.map((m) => ({
        ...m,
        logKfP : calcLogKfPrime(m, pH),
        logKfPP: calcLogKfDoublePrime(m, pH),
        minPH  : minTitrationPH(m, 8),
      })),
    [pH],
  )

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.complexation.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("advanced.complexation.description")}</p>

      <Tabs defaultValue="edta">
        <TabsList className="h-7 text-[11px]">
          <TabsTrigger value="edta" className="px-3 text-[11px]">
            {t("advanced.complexation.tabEdta")}
          </TabsTrigger>
          <TabsTrigger value="stepwise" className="px-3 text-[11px]">
            {t("advanced.complexation.tabStepwise")}
          </TabsTrigger>
        </TabsList>

        {/* ── EDTA tab ──────────────────────────────────────────────── */}
        <TabsContent value="edta" className="mt-4 space-y-4">

          {/* pH slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("advanced.complexation.pHLabel")}</span>
              <span className="font-mono text-foreground">
                pH = {pH.toFixed(1)}
                &nbsp;·&nbsp;
                α<sub>Y⁴⁻</sub> = {alphaY4.toExponential(2)}
                &nbsp;·&nbsp;
                log α<sub>Y⁴⁻</sub> = {logAlphaY4.toFixed(2)}
              </span>
            </div>
            <Slider
              min={0} max={14} step={0.1}
              value={[pH]}
              onValueChange={([v]: number[]) => setPH(v)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>pH 0</span><span>pH 7</span><span>pH 14</span>
            </div>
          </div>

          {/* Equations legend */}
          <div className="rounded-md border border-border/40 bg-muted/20 px-4 py-3 text-[11px] text-muted-foreground space-y-0.5">
            <p><span className="font-mono text-foreground">log K<sub>f</sub></span>  = constante termodinámica (25 °C, I ≈ 0.1 M)</p>
            <p><span className="font-mono text-foreground">log K<sub>f</sub>′</span> = log K<sub>f</sub> + log α<sub>Y⁴⁻</sub>(pH)  — sólo reacciones laterales del ligando</p>
            <p><span className="font-mono text-foreground">log K<sub>f</sub>″</span> = log K<sub>f</sub>′ − log α<sub>M(OH)</sub>(pH) — también incluye hidrólisis del metal</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border border-border/40">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">{t("advanced.complexation.metal")}</th>
                  <th className="px-3 py-2 text-right font-medium">log K<sub>f</sub></th>
                  <th className="px-3 py-2 text-right font-medium">log K<sub>f</sub>′</th>
                  <th className="px-3 py-2 text-right font-medium">log K<sub>f</sub>″</th>
                  <th className="px-3 py-2 text-right font-medium">{t("advanced.complexation.minPH")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const viable = r.logKfPP >= 8
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-border/20 ${viable ? "bg-emerald-50/10 dark:bg-emerald-950/10" : ""} ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                    >
                      <td className="px-3 py-2 font-mono text-foreground">{r.symbol}</td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">{r.logKf.toFixed(2)}</td>
                      <td className={`px-3 py-2 text-right font-mono ${kfColor(r.logKfP)}`}>
                        {r.logKfP.toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 text-right font-mono font-medium ${kfColor(r.logKfPP)}`}>
                        {r.logKfPP.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {r.minPH !== null ? `pH ${r.minPH.toFixed(1)}` : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Color legend */}
          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="text-emerald-600 dark:text-emerald-400">■ log K ≥ 12 (muy estable)</span>
            <span className="text-amber-600 dark:text-amber-400">■ log K ≥ 8 (titulable)</span>
            <span className="text-orange-600 dark:text-orange-400">■ log K ≥ 4 (débil)</span>
            <span className="text-rose-600 dark:text-rose-400">■ log K &lt; 4 (inestable)</span>
          </div>

          {/* αY⁴⁻ vs pH mini sparkline */}
          <ComplexationPanelSparkline currentPH={pH} />
        </TabsContent>

        {/* ── Stepwise (ammonia) tab ─────────────────────────────────── */}
        <TabsContent value="stepwise" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">{t("advanced.complexation.stepwiseDesc")}</p>

          {AMMONIA_COMPLEXES.map((c) => {
            const lastBeta = c.logBeta[c.logBeta.length - 1]
            return (
              <div key={c.id} className="rounded-md border border-border/40 bg-card/40 p-3 space-y-2">
                <p className="text-xs font-medium text-foreground">{c.label[locale]}</p>
                <div className="flex flex-wrap gap-2">
                  {c.logKn.map((lk, i) => (
                    <div key={i} className="rounded border border-border/40 bg-muted/30 px-2.5 py-1 text-center min-w-[54px]">
                      <p className="text-[9px] text-muted-foreground font-mono">
                        log K<sub>{i + 1}</sub>
                      </p>
                      <p className={`font-mono text-xs font-medium ${kfColor(lk * 2)}`}>
                        {lk.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="rounded border border-sky-400/40 bg-sky-50/10 dark:bg-sky-950/10 px-2.5 py-1 text-center min-w-[64px]">
                    <p className="text-[9px] text-muted-foreground font-mono">
                      log β<sub>{c.logKn.length}</sub>
                    </p>
                    <p className={`font-mono text-xs font-bold ${kfColor(lastBeta)}`}>
                      {lastBeta.toFixed(2)}
                    </p>
                  </div>
                </div>
                {/* β bar */}
                <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute h-full rounded-full bg-sky-500/70"
                    style={{ width: `${Math.min((lastBeta / 20) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground font-mono">
                  β<sub>{c.logKn.length}</sub> = 10<sup>{lastBeta.toFixed(2)}</sup>
                  &nbsp;—&nbsp;Kf escalonados: K<sub>1</sub> &gt; K<sub>2</sub> &gt; … (estadística)
                </p>
              </div>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
