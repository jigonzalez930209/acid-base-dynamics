import { useMemo, useState } from "react"

import { Beaker } from "lucide-react"
import { useTranslation } from "react-i18next"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { buildTitrationSeries, calcTitrationVolume } from "@/features/chemistry/lib/acid-math"
import type { ActiveSlot } from "@/features/chemistry/types/models"

type TitrationChartProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
  onConcentrationChange: (slotIndex: number, isBase: boolean, value: number) => void
}

export function TitrationChart({ activeSlots, globalPH, onConcentrationChange }: TitrationChartProps) {
  const { t } = useTranslation()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const chartData = useMemo(
    () =>
      activeSlots.map((slot, slotIndex) => ({
        ...slot,
        slotIndex,
        series: buildTitrationSeries(slot.pKas, slot.concentrationCA, slot.concentrationCB),
      })),
    [activeSlots]
  )

  const equivalencePoints = useMemo(() => {
    const points: Array<{ slotIndex: number; pKa: number; volume: number; color: string; name: string }> = []
    chartData.forEach((slot) => {
      slot.pKas.forEach((pKa) => {
        const volume = calcTitrationVolume(pKa, slot.pKas, slot.concentrationCA, 100, slot.concentrationCB)
        if (volume >= 0 && volume <= 350) {
          points.push({ slotIndex: slot.slotIndex, pKa, volume, color: slot.color, name: slot.acid.names["en"] })
        }
      })
    })
    return points
  }, [chartData])

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Beaker className="size-5 text-primary" />
          {t("charts.titrationTitle")}
        </CardTitle>
        <CardDescription>{t("charts.titrationDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3 md:px-4 md:pb-4 text-foreground">

        {/* Concentration sliders – one row per active slot */}
        {activeSlots.length > 0 && (
          <div className="mb-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("charts.concentrations")}
            </p>
            {activeSlots.map((slot, slotIndex) => (
              <div key={`conc-${slot.acid.id}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slot.color }} />
                  <span className="text-sm font-medium">{slot.acid.names["en"]}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {/* Valorado (CA) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("charts.analyte")}</span>
                      <span className="font-mono text-xs tabular-nums">{slot.concentrationCA.toFixed(2)} M</span>
                    </div>
                    <Slider
                      value={[slot.concentrationCA]}
                      onValueChange={(v) => onConcentrationChange(slotIndex, false, v[0])}
                      min={0.01}
                      max={2}
                      step={0.01}
                    />
                  </div>
                  {/* Valorante (CB) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("charts.titrant")}</span>
                      <span className="font-mono text-xs tabular-nums">{slot.concentrationCB.toFixed(2)} M</span>
                    </div>
                    <Slider
                      value={[slot.concentrationCB]}
                      onValueChange={(v) => onConcentrationChange(slotIndex, true, v[0])}
                      min={0.01}
                      max={2}
                      step={0.01}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <SvgChart
          xLabel={t("charts.xVolume")}
          yLabel={t("charts.yPh")}
          xMin={0}
          xMax={350}
          yMin={0}
          yMax={14}
          xTicks={[0, 50, 100, 150, 200, 250, 300, 350]}
          yTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
        >
          {({ left, width, mapX, mapY }) => (
            <>
              {chartData.map((slot) => (
                <path
                  key={slot.acid.id}
                  d={buildLinePath(slot.series, mapX, mapY)}
                  fill="none"
                  stroke={slot.color}
                  strokeWidth="3"
                  strokeDasharray={slot.dash}
                />
              ))}
              {/* Global pH line */}
              <line
                x1={left} y1={mapY(globalPH)}
                x2={left + width} y2={mapY(globalPH)}
                stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.45"
              />
              {/* Equivalence point markers */}
              {equivalencePoints.map((pt, i) => (
                <circle
                  key={`eq-${i}`}
                  cx={mapX(pt.volume)}
                  cy={mapY(pt.pKa)}
                  r={hoveredIdx === i ? 6 : 4}
                  fill={pt.color}
                  opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.35}
                  style={{ cursor: "pointer", transition: "r 0.1s, opacity 0.15s" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
            </>
          )}
        </SvgChart>

        {/* Equivalence points table */}
        {equivalencePoints.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("charts.equivalencePoints")}
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("charts.eqAcid")}</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">{t("charts.eqPka")}</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">{t("charts.eqVolume")}</th>
                  </tr>
                </thead>
                <tbody>
                  {equivalencePoints.map((pt, i) => (
                    <tr
                      key={`row-${i}`}
                      className="border-b last:border-0 transition-colors"
                      style={{ backgroundColor: hoveredIdx === i ? `${pt.color}18` : undefined }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: pt.color }} />
                          {pt.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center font-mono tabular-nums">{pt.pKa.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center font-mono tabular-nums">{pt.volume.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

