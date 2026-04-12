import { useMemo } from "react"

import { useTranslation } from "react-i18next"

import { MathExpression } from "@/components/shared/math-expression"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buildAlphaModel } from "@/features/chemistry/lib/formulas"
import { calcAlphas } from "@/features/chemistry/lib/acid-math"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type MathModelPanelProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
}

export function MathModelPanel({ activeSlots, globalPH, locale }: MathModelPanelProps) {
  const { t } = useTranslation()
  const maxOrder = useMemo(() => Math.max(1, ...activeSlots.map((slot) => slot.acid.proticType)), [activeSlots])
  const model = buildAlphaModel(maxOrder)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("model.title")}</CardTitle>
        <CardDescription>{t("model.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 xl:grid-cols-[1fr_260px]">

        {/* Left: equation system */}
        <div className="space-y-5 min-w-0">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("model.denominator")}
            </p>
            <MathExpression block math={model.denominator} className="text-foreground" />
          </div>
          <Separator />
          <div className="space-y-2">
            {model.alphaExpressions.map((expression) => (
              <MathExpression key={expression} block math={expression} className="text-foreground" />
            ))}
          </div>
          <Separator />
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("model.avgCharge")}
            </p>
            <MathExpression block math={model.averageCharge} className="text-foreground" />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("model.titration")}
            </p>
            <MathExpression block math={model.titration} className="text-foreground" />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("model.concentrations")}
            </p>
            <MathExpression block math={model.concentrations} className="text-foreground" />
          </div>
        </div>

        {/* Right: fractions per acid */}
        <div className="space-y-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("model.currentFractions")}
          </p>
          {activeSlots.length > 0 ? (
            activeSlots.map((slot, slotIdx) => {
              const fractions = calcAlphas(globalPH, slot.pKas)
              return (
                <div key={slot.acid.id}>
                  {slotIdx > 0 && <Separator className="mb-5" />}
                  <div className="mb-2 flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: slot.color }} />
                    <span className="text-sm font-medium text-foreground">{slot.acid.names[locale]}</span>
                    <span className="text-xs text-muted-foreground font-mono">pH {globalPH.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {fractions.map((fraction, index) => (
                      <div
                        key={`${slot.acid.id}-${index}`}
                        className="flex items-baseline justify-between rounded bg-muted/50 px-2 py-1"
                      >
                        <span className="text-xs text-muted-foreground">α{index}</span>
                        <span className="font-mono text-xs font-semibold text-foreground">{fraction.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground">{t("misc.unsupported")}</p>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
