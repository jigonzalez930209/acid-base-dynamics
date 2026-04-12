import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { calcAlphas } from "@/features/chemistry/lib/acid-math"
import { buildSymbolicSpecies } from "@/features/chemistry/lib/formulas"
import { ChemicalFormula } from "@/components/shared/chemical-formula"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
}

const DELTA = 0.05

function calcSensitivity(pH: number, pKas: number[]) {
  const a1 = calcAlphas(pH + DELTA, pKas)
  const a0 = calcAlphas(Math.max(0.001, pH - DELTA), pKas)
  return a1.map((v, i) => (v - a0[i]) / (2 * DELTA))
}

export function SensitivityPanel({ activeSlots, globalPH, locale }: Props) {
  const { t } = useTranslation()

  const rows = useMemo(
    () =>
      activeSlots.map((slot) => ({
        slot,
        alphas: calcAlphas(globalPH, slot.pKas),
        sensitivity: calcSensitivity(globalPH, slot.pKas),
        species: buildSymbolicSpecies(slot.acid.proticType),
      })),
    [activeSlots, globalPH]
  )

  if (activeSlots.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.sensitivity.title")}</h3>
      <p className="text-xs text-muted-foreground">
        {t("advanced.sensitivity.description")} pH = {globalPH.toFixed(2)}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border/40">
              <th className="py-1 pr-4 font-medium">{t("advanced.sensitivity.acid")}</th>
              <th className="py-1 pr-4 font-medium">{t("advanced.sensitivity.species")}</th>
              <th className="py-1 pr-4 font-mono font-medium">α</th>
              <th className="py-1 font-mono font-medium">dα/dpH</th>
            </tr>
          </thead>
          <tbody>
            {rows.flatMap(({ slot, alphas, sensitivity, species }) =>
              species.map((sp, i) => (
                <tr key={`${slot.acid.id}-${i}`} className="border-b border-border/20">
                  {i === 0 && (
                    <td rowSpan={species.length} className="py-1 pr-4 align-top pt-2">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: slot.color }}
                        />
                        <span className="text-foreground">{slot.acid.names[locale]}</span>
                      </span>
                    </td>
                  )}
                  <td className="py-1 pr-4 text-muted-foreground"><ChemicalFormula formula={sp} /></td>
                  <td className="py-1 pr-4 font-mono">{(alphas[i] ?? 0).toFixed(4)}</td>
                  <td className={`py-1 font-mono ${(sensitivity[i] ?? 0) > 0 ? "text-sky-600 dark:text-sky-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {(sensitivity[i] ?? 0).toFixed(4)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
