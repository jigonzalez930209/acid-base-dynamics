import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Slider } from "@/components/ui/slider"
import { calcTempAdjustedPKas } from "@/features/advanced/advanced-math"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = { activeSlots: ActiveSlot[]; locale: Locale }

export function TemperatureOverlay({ activeSlots, locale }: Props) {
  const { t } = useTranslation()
  const [tempC, setTempC] = useState(25)
  const [deltaH, setDeltaH] = useState(10)

  const rows = useMemo(
    () => activeSlots.map((slot) => ({
      slot,
      adjusted: calcTempAdjustedPKas(slot.pKas, tempC, deltaH),
    })),
    [activeSlots, tempC, deltaH]
  )

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.temperature.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("advanced.temperature.description")}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("advanced.temperature.temp")}</span>
            <span className="font-mono text-foreground">{tempC} °C</span>
          </div>
          <Slider min={5} max={80} step={1} value={[tempC]}
            onValueChange={([v]: number[]) => setTempC(v)} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5 °C</span><span>80 °C</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("advanced.temperature.deltah")}</span>
            <span className="font-mono text-foreground">{deltaH > 0 ? "+" : ""}{deltaH} kJ/mol</span>
          </div>
          <Slider min={-30} max={30} step={1} value={[deltaH]}
            onValueChange={([v]: number[]) => setDeltaH(v)} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>−30 kJ/mol</span><span>+30 kJ/mol</span>
          </div>
        </div>
      </div>

      {activeSlots.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/40 text-left text-muted-foreground">
                <th className="py-1 pr-4 font-medium">{t("advanced.temperature.acid")}</th>
                <th className="py-1 pr-4 font-medium">pKa (25 °C)</th>
                <th className="py-1 pr-4 font-medium">pKa ({tempC} °C)</th>
                <th className="py-1 font-medium">Δ pKa</th>
              </tr>
            </thead>
            <tbody>
              {rows.flatMap(({ slot, adjusted }) =>
                slot.pKas.map((pKa, i) => {
                  const delta = adjusted[i] - pKa
                  return (
                    <tr key={`${slot.acid.id}-${i}`} className="border-b border-border/20">
                      {i === 0 && (
                        <td rowSpan={slot.pKas.length} className="py-1.5 pr-4 align-top">
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: slot.color }} />
                            <span className="text-foreground">{slot.acid.names[locale]}</span>
                          </span>
                        </td>
                      )}
                      <td className="py-1 pr-4 font-mono">{pKa.toFixed(2)}</td>
                      <td className="py-1 pr-4 font-mono">{adjusted[i].toFixed(2)}</td>
                      <td className={`py-1 font-mono ${delta > 0.005 ? "text-amber-600 dark:text-amber-400" : delta < -0.005 ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground"}`}>
                        {delta >= 0 ? "+" : ""}{delta.toFixed(3)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">{t("misc.unsupported")}</p>
      )}
    </div>
  )
}
