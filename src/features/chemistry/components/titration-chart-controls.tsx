import type { MutableRefObject } from "react"

import { useTranslation } from "react-i18next"

import { Slider } from "@/components/ui/slider"
import type { ActiveSlot } from "@/features/chemistry/types/models"

type Props = {
  activeSlots: ActiveSlot[]
  slotIdsKey: string
  caLabelRefs: MutableRefObject<(HTMLSpanElement | null)[]>
  cbLabelRefs: MutableRefObject<(HTMLSpanElement | null)[]>
  onConcentrationChange: (slotIndex: number, isBase: boolean, value: number) => void
  onConcentrationCommit: (slotIndex: number, isBase: boolean, value: number) => void
}

export function TitrationChartControls({
  activeSlots,
  slotIdsKey,
  caLabelRefs,
  cbLabelRefs,
  onConcentrationChange,
  onConcentrationCommit,
}: Props) {
  const { t } = useTranslation()

  if (activeSlots.length === 0) return null

  return (
    <div key={slotIdsKey} className="mb-5 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("charts.concentrations")}
      </p>
      {activeSlots.map((slot, slotIndex) => (
        <div key={slot.acid.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slot.color }} />
            <span className="text-sm font-medium">{slot.acid.names.en}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("charts.analyte")}</span>
                <span ref={(el) => { caLabelRefs.current[slotIndex] = el }} className="font-mono text-xs tabular-nums">
                  {slot.concentrationCA.toFixed(2)} M
                </span>
              </div>
              <Slider
                defaultValue={[slot.concentrationCA]}
                onValueChange={(value) => onConcentrationChange(slotIndex, false, value[0])}
                onValueCommit={(value) => onConcentrationCommit(slotIndex, false, value[0])}
                min={0.01}
                max={2}
                step={0.01}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("charts.titrant")}</span>
                <span ref={(el) => { cbLabelRefs.current[slotIndex] = el }} className="font-mono text-xs tabular-nums">
                  {slot.concentrationCB.toFixed(2)} M
                </span>
              </div>
              <Slider
                defaultValue={[slot.concentrationCB]}
                onValueChange={(value) => onConcentrationChange(slotIndex, true, value[0])}
                onValueCommit={(value) => onConcentrationCommit(slotIndex, true, value[0])}
                min={0.01}
                max={2}
                step={0.01}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}