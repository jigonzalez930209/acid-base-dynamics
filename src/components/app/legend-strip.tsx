import { useTranslation } from "react-i18next"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type LegendStripProps = {
  activeSlots: ActiveSlot[]
  locale: Locale
}

export function LegendStrip({ activeSlots, locale }: LegendStripProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t("legend.title")}
      </span>
      {activeSlots.length > 0 ? (
        activeSlots.map((slot) => (
          <div key={slot.acid.id} className="flex items-center gap-2">
            <svg width="20" height="8" aria-hidden="true" className="shrink-0">
              <line x1="0" y1="4" x2="20" y2="4" stroke={slot.color} strokeWidth="2.5" strokeDasharray={slot.dash} />
            </svg>
            <span className="text-sm text-foreground">{slot.acid.names[locale]}</span>
            <ChemicalFormula formula={slot.acid.formula} className="text-sm text-muted-foreground" />
          </div>
        ))
      ) : (
        <span className="text-sm text-muted-foreground">{t("legend.empty")}</span>
      )}
    </div>
  )
}
