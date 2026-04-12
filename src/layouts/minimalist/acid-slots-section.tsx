import { useRef, useCallback } from "react"
import { useTranslation } from "react-i18next"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AcidRecord, ActiveSlot, Locale } from "@/features/chemistry/types/models"

type AcidSlotsSectionProps = {
  resolvedSlots: ActiveSlot[]
  acidDatabase: AcidRecord[]
  locale: Locale
  onAcidChange: (slotIndex: number, acidId: string) => void
  onPKaChange: (slotIndex: number, pKaIndex: number, value: number) => void
  onPKaChangeLive: (slotIndex: number, pKaIndex: number, value: number) => void
}

export function AcidSlotsSection({ resolvedSlots, acidDatabase, locale, onAcidChange, onPKaChange, onPKaChangeLive }: AcidSlotsSectionProps) {
  const { t } = useTranslation()
  // label refs: [slotIndex][pKaIndex]
  const labelRefs = useRef<(HTMLSpanElement | null)[][]>([])

  const handleLive = useCallback((slotIndex: number, pKaIndex: number, value: number) => {
    const el = labelRefs.current[slotIndex]?.[pKaIndex]
    if (el) el.textContent = value.toFixed(2)
    onPKaChangeLive(slotIndex, pKaIndex, value)
  }, [onPKaChangeLive])

  return (
    <section className="mb-12">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
        {t("controls.chooseAcid")}
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {resolvedSlots.map((slot, idx) => (
          <div key={`slot-${idx}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-1.5 rounded-full" style={{ backgroundColor: slot.acid.id !== "none" ? slot.color : "var(--border)" }} />
              <span className="text-xs text-muted-foreground">{t("controls.slot", { index: idx + 1 })}</span>
            </div>
            <Select value={slot.acidId} onValueChange={(v) => onAcidChange(idx, v)}>
              <SelectTrigger className="w-full border-0 border-b border-border/50 rounded-none bg-transparent px-0 shadow-none text-sm focus:ring-0">
                <SelectValue placeholder={t("controls.chooseAcid")} />
              </SelectTrigger>
              <SelectContent>
                {acidDatabase.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.names[locale]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {slot.acid.id !== "none" && (
              // key={slot.acidId} remounts sliders (new defaultValue) when acid changes
              <div key={slot.acidId} className="mt-3 space-y-3">
                <ChemicalFormula formula={slot.acid.formula} className="text-xs text-muted-foreground" />
                {slot.pKas.map((pKa, pIdx) => (
                  <div key={`${idx}-${pIdx}`} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{t("controls.pka", { index: pIdx + 1 })}</span>
                      <span
                        ref={(el) => { (labelRefs.current[idx] ??= [])[pIdx] = el }}
                        className="font-mono"
                      >
                        {pKa.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[pKa]}
                      min={-1} max={14} step={0.01}
                      onValueChange={(v) => handleLive(idx, pIdx, v[0] ?? pKa)}
                      onValueCommit={(v) => onPKaChange(idx, pIdx, v[0] ?? pKa)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
