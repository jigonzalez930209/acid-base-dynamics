import { useMemo } from "react"

import { useTranslation } from "react-i18next"

import { MathExpression } from "@/components/shared/math-expression"
import { Separator } from "@/components/ui/separator"
import { calcAlphas } from "@/features/chemistry/lib/acid-math"
import { buildAlphaModel } from "@/features/chemistry/lib/formulas"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type ModelTabProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
}

export function ModelTab({ activeSlots, globalPH, locale }: ModelTabProps) {
  const { t } = useTranslation()
  const maxOrder = useMemo(() => Math.max(1, ...activeSlots.map((s) => s.acid.proticType)), [activeSlots])
  const model = buildAlphaModel(maxOrder)

  const modelRows = [
    { key: "model.avgCharge", math: model.averageCharge },
    { key: "model.titration", math: model.titration },
    { key: "model.concentrations", math: model.concentrations },
  ]

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_240px]">
      <div className="space-y-5 min-w-0 overflow-x-auto">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("model.denominator")}</p>
          <div className="overflow-x-auto"><MathExpression block math={model.denominator} className="text-foreground" /></div>
        </div>
        <Separator className="opacity-20" />
        <div className="space-y-2 overflow-x-auto">
          {model.alphaExpressions.map((expr) => (
            <MathExpression key={expr} block math={expr} className="text-foreground" />
          ))}
        </div>
        <Separator className="opacity-20" />
        {modelRows.map(({ key, math }) => (
          <div key={key}>
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t(key)}</p>
            <div className="overflow-x-auto"><MathExpression block math={math} className="text-foreground" /></div>
          </div>
        ))}
      </div>

      <div className="space-y-4 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("model.currentFractions")}</p>
        {activeSlots.length > 0 ? (
          activeSlots.map((slot, si) => {
            const fractions = calcAlphas(globalPH, slot.pKas)
            return (
              <div key={slot.acid.id}>
                {si > 0 && <Separator className="mb-4 opacity-20" />}
                <div className="mb-2 flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full" style={{ backgroundColor: slot.color }} />
                  <span className="text-xs text-foreground">{slot.acid.names[locale]}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">pH {globalPH.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {fractions.map((f, i) => (
                    <div key={`${slot.acid.id}-${i}`} className="flex justify-between py-0.5 text-[11px]">
                      <span className="text-muted-foreground">α{i}</span>
                      <span className="font-mono text-foreground">{f.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground">{t("misc.unsupported")}</p>
        )}
      </div>
    </div>
  )
}
