import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { buildSymbolicSpecies } from "@/features/chemistry/lib/formulas"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = {
  slot: ActiveSlot
  locale: Locale
}

const PROTIC_LABEL: Record<number, Record<"es" | "en", string>> = {
  0: { es: "no prótico", en: "non-protic" },
  1: { es: "monoprótico", en: "monoprotic" },
  2: { es: "diprótico", en: "diprotic" },
  3: { es: "triprótico", en: "triprotic" },
}

export function SpeciesDescriptorCard({ slot, locale }: Props) {
  const { t } = useTranslation()
  const species = buildSymbolicSpecies(slot.acid.proticType)
  const proticLabel = PROTIC_LABEL[slot.acid.proticType]?.[locale] ?? ""

  return (
    <div className="rounded-md border border-border/50 bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: slot.color }}
          />
          <span className="font-medium text-sm text-foreground">
            {slot.acid.names[locale]}
          </span>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">{proticLabel}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span className="mr-1">{t("advanced.species.formula")}:</span>
        <ChemicalFormula formula={slot.acid.formula} />
      </div>

      {slot.acid.pKas.length > 0 && (
        <div className="text-xs space-y-1">
          <p className="text-muted-foreground">{t("advanced.species.pkas")}:</p>
          <div className="flex flex-wrap gap-2">
            {slot.pKas.map((pKa, i) => (
              <span key={i} className="rounded bg-muted px-2 py-0.5 font-mono text-foreground">
                pKa{i + 1} = {pKa.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs space-y-1">
        <p className="text-muted-foreground">{t("advanced.species.chain")}:</p>
        <div className="flex flex-wrap items-center gap-1">
          {species.map((sp, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChemicalFormula formula={sp} />
              {i < species.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {slot.acid.tags && slot.acid.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {slot.acid.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}
