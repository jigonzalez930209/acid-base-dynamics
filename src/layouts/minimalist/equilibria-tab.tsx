import { useTranslation } from "react-i18next"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { MathExpression } from "@/components/shared/math-expression"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getEquilibriumSteps } from "@/features/chemistry/lib/equilibria"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type EquilibriaTabProps = {
  activeSlots: ActiveSlot[]
  locale: Locale
}

export function EquilibriaTab({ activeSlots, locale }: EquilibriaTabProps) {
  const { t } = useTranslation()

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-8">
        {activeSlots.length > 0 ? (
          activeSlots.map((slot) => {
            const steps = getEquilibriumSteps(slot.acid)
            return (
              <div key={slot.acid.id}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-0.5" style={{ backgroundColor: slot.color }} />
                  <span className="text-sm text-foreground">{slot.acid.names[locale]}</span>
                  <ChemicalFormula formula={slot.acid.formula} className="text-xs text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={`${slot.acid.id}-${step.index}`}>
                      {i > 0 && <Separator className="my-3 opacity-20" />}
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Ka{step.index}</span>
                        <span className="font-mono">pKa = {step.pKa.toFixed(2)}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <MathExpression block math={step.equation} className="text-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">{t("misc.unsupported")}</p>
        )}
      </div>
    </ScrollArea>
  )
}
