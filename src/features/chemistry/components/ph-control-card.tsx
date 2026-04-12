import { FlaskConical, Layers3 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { classifyPH } from "@/features/chemistry/lib/acid-math"

type PhControlCardProps = {
  globalPH: number
  activeCount: number
  equilibriumCount: number
  onPHChange: (value: number) => void
}

export function PhControlCard({ globalPH, activeCount, equilibriumCount, onPHChange }: PhControlCardProps) {
  const { t } = useTranslation()
  const profile = classifyPH(globalPH)

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        {/* pH display */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            {t("controls.systemPH")}
          </p>
          <div className="text-5xl font-bold tracking-tight tabular-nums text-foreground">
            {globalPH.toFixed(2)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t(`controls.profile.${profile}`)}</p>
        </div>

        {/* Slider */}
        <Slider
          value={[globalPH]}
          min={0}
          max={14}
          step={0.05}
          onValueChange={(value) => onPHChange(value[0] ?? globalPH)}
        />

        <Separator />

        {/* Stats — simple text rows, no inner boxes */}
        <div className="grid grid-cols-3 divide-x text-sm">
          <div className="pr-3">
            <FlaskConical className="mb-1.5 size-3.5 text-muted-foreground" />
            <div className="font-semibold tabular-nums text-foreground">{activeCount}</div>
            <div className="text-xs text-muted-foreground">{t("controls.activeSystems")}</div>
          </div>
          <div className="px-3">
            <Layers3 className="mb-1.5 size-3.5 text-muted-foreground" />
            <div className="font-semibold tabular-nums text-foreground">{equilibriumCount}</div>
            <div className="text-xs text-muted-foreground">{t("controls.equilibriumSteps")}</div>
          </div>
          <div className="pl-3">
            <div className="mb-1.5 h-3.5" />
            <div className="font-semibold text-foreground">{String(profile)}</div>
            <div className="text-xs text-muted-foreground">{t("controls.profileLabel")}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
