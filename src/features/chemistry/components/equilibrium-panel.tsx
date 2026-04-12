import { useTranslation } from "react-i18next"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { MathExpression } from "@/components/shared/math-expression"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getEquilibriumSteps } from "@/features/chemistry/lib/equilibria"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type EquilibriumPanelProps = {
  activeSlots: ActiveSlot[]
  locale: Locale
}

export function EquilibriumPanel({ activeSlots, locale }: EquilibriumPanelProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("equilibria.title")}</CardTitle>
        <CardDescription>{t("equilibria.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-125 pr-3">
          <div className="space-y-8">
            {activeSlots.length > 0 ? (
              activeSlots.map((slot) => {
                const steps = getEquilibriumSteps(slot.acid)
                const isSymbolic = steps.some((s) => s.mode === "symbolic")

                return (
                  <div key={slot.acid.id}>
                    {/* Acid header row */}
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: slot.color }} />
                        <span className="font-semibold text-foreground">{slot.acid.names[locale]}</span>
                        <ChemicalFormula formula={slot.acid.formula} className="text-sm text-muted-foreground" />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {isSymbolic ? t("equilibria.symbolic") : t("equilibria.structural")}
                      </span>
                    </div>

                    {/* Steps — flat list with separators */}
                    <div className="space-y-0">
                      {steps.map((step, i) => (
                        <div key={`${slot.acid.id}-${step.index}`}>
                          {i > 0 && <Separator className="my-3" />}
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span className="font-medium">Ka{step.index}</span>
                            <span className="font-mono">pKa = {step.pKa.toFixed(2)}</span>
                          </div>
                          <MathExpression block math={step.equation} className="text-foreground" />
                        </div>
                      ))}
                    </div>

                    {slot.acid.notes?.[locale] && (
                      <p className="mt-3 border-l-2 border-muted pl-3 text-xs italic text-muted-foreground">
                        {slot.acid.notes[locale]}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t("misc.unsupported")}
              </div>
            )}

            <p className="border-l-2 border-muted pl-3 text-xs italic text-muted-foreground">
              {t("equilibria.symbolicHint")}
            </p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
