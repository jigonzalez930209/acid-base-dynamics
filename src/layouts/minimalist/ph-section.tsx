import { useTranslation } from "react-i18next"

import { Slider } from "@/components/ui/slider"
import type { ActiveSlot } from "@/features/chemistry/types/models"

type PHSectionProps = {
  globalPH: number
  profile: string
  activeSlots: ActiveSlot[]
  equilibriumCount: number
  onPHChange: (v: number) => void
}

export function PHSection({ globalPH, profile, activeSlots, equilibriumCount, onPHChange }: PHSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="mb-12">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">
          {t("controls.systemPH")}
        </p>
        <span className="text-6xl font-extralight tabular-nums text-foreground leading-none">
          {globalPH.toFixed(2)}
        </span>
        <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>{t(`controls.profile.${profile}`)}</span>
          <span>{activeSlots.length} {t("controls.activeSystems")}</span>
          <span>{equilibriumCount} {t("controls.equilibriumSteps")}</span>
        </div>
      </div>
      <Slider
        value={[globalPH]}
        min={0}
        max={14}
        step={0.05}
        onValueChange={(v) => onPHChange(v[0] ?? globalPH)}
        className="max-w-xl"
      />
    </section>
  )
}
