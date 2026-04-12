import { Beaker } from "lucide-react"
import { useTranslation } from "react-i18next"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import type { AcidRecord, Locale, SlotState } from "@/features/chemistry/types/models"

type AcidSlotCardProps = {
  slotIndex: number
  slot: SlotState
  acid: AcidRecord
  acids: AcidRecord[]
  locale: Locale
  onAcidChange: (slotIndex: number, acidId: string) => void
  onPkaChange: (slotIndex: number, pkaIndex: number, nextValue: number) => void
}

export function AcidSlotCard({
  slotIndex,
  slot,
  acid,
  acids,
  locale,
  onAcidChange,
  onPkaChange,
}: AcidSlotCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="overflow-hidden">
      {/* Accent color bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: acid.id === "none" ? "hsl(var(--border))" : slot.color }}
      />

      <CardContent className="p-4 space-y-4">
        {/* Slot label + acid identity */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Beaker className="size-3 shrink-0" style={{ color: acid.id === "none" ? undefined : slot.color }} />
              {t("controls.slot", { index: slotIndex + 1 })}
            </div>
            <div className="text-base font-semibold text-foreground truncate">{acid.names[locale]}</div>
            {acid.id !== "none" && (
              <ChemicalFormula formula={acid.formula} className="text-sm text-muted-foreground" />
            )}
          </div>
          {acid.proticType > 0 && (
            <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {acid.proticType} pKa
            </span>
          )}
        </div>

        {/* Acid selector */}
        <Select value={slot.acidId} onValueChange={(value) => onAcidChange(slotIndex, value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("controls.chooseAcid")} />
          </SelectTrigger>
          <SelectContent>
            {acids.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.names[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* pKa sliders — only shown when an acid is selected */}
        {acid.id !== "none" && (
          <>
            <Separator />
            <div className="space-y-4">
              {slot.pKas.map((pKa, pKaIndex) => (
                <div key={`${slotIndex}-${pKaIndex}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("controls.pka", { index: pKaIndex + 1 })}</span>
                    <span className="font-mono font-semibold text-foreground">{pKa.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[pKa]}
                    min={-1}
                    max={14}
                    step={0.01}
                    onValueChange={(value) => onPkaChange(slotIndex, pKaIndex, value[0] ?? pKa)}
                  />
                </div>
              ))}
            </div>

            {acid.notes?.[locale] ? (
              <p className="border-l-2 border-muted pl-3 text-xs italic text-muted-foreground">
                {acid.notes[locale]}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
