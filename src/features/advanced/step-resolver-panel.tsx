import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { calcAlphas, calcAverageDeprotonation, calcTitrationVolume, classifyPH } from "@/features/chemistry/lib/acid-math"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
}

type Step = { label: string; value: string; detail?: string }

function buildSteps(slot: ActiveSlot, pH: number, t: (key: string) => string): Step[] {
  const H = 10 ** -pH
  const OH = 10 ** -(14 - pH)
  const alphas = calcAlphas(pH, slot.pKas)
  const nBar = calcAverageDeprotonation(alphas)
  const Vb = calcTitrationVolume(pH, slot.pKas)
  const profile = classifyPH(pH)

  return [
    { label: t("advanced.resolver.step1"), value: `pH = ${pH.toFixed(2)}`, detail: `${t(`ph.profile.${profile}`)}` },
    { label: t("advanced.resolver.step2"), value: `[H⁺] = ${H.toExponential(3)} mol/L`, detail: `[OH⁻] = ${OH.toExponential(3)} mol/L` },
    { label: t("advanced.resolver.step3"), value: alphas.map((a, i) => `α${i} = ${a.toFixed(4)}`).join("  ") },
    { label: t("advanced.resolver.step4"), value: `n̄ = ${nBar.toFixed(4)}` },
    ...(Vb >= 0 ? [{ label: t("advanced.resolver.step5"), value: `Vb = ${Vb.toFixed(2)} mL` }] : []),
  ]
}

export function StepResolverPanel({ activeSlots, globalPH, locale }: Props) {
  const { t } = useTranslation()

  const allSteps = useMemo(
    () => activeSlots.map((slot) => ({ slot, steps: buildSteps(slot, globalPH, t) })),
    [activeSlots, globalPH, t]
  )

  if (activeSlots.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.resolver.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("advanced.resolver.description")}</p>
      <div className="space-y-6">
        {allSteps.map(({ slot, steps }) => (
          <div key={slot.acid.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: slot.color }} />
              <span className="text-xs font-medium text-foreground">{slot.acid.names[locale]}</span>
            </div>
            <ol className="space-y-1.5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs text-muted-foreground">{step.label}</span>
                    <span className="font-mono text-xs text-foreground break-all">{step.value}</span>
                    {step.detail && (
                      <span className="text-xs text-muted-foreground">{step.detail}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}
