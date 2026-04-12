import { useMemo } from "react"

import { Activity } from "lucide-react"
import { useTranslation } from "react-i18next"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buildSpeciationSeries } from "@/features/chemistry/lib/acid-math"
import type { ActiveSlot } from "@/features/chemistry/types/models"

type SpeciationChartProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
}

export function SpeciationChart({ activeSlots, globalPH }: SpeciationChartProps) {
  const { t } = useTranslation()
  const chartData = useMemo(
    () => activeSlots.map((slot) => ({ ...slot, series: buildSpeciationSeries(slot.pKas) })),
    [activeSlots]
  )

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="size-5 text-primary" />
          {t("charts.speciationTitle")}
        </CardTitle>
        <CardDescription>{t("charts.speciationDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3 md:px-4 md:pb-4 text-foreground">
        <SvgChart
          xLabel={t("charts.xPh")}
          yLabel={t("charts.yAlpha")}
          xMin={0}
          xMax={14}
          yMin={0}
          yMax={1}
          xTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
          yTicks={[0, 0.25, 0.5, 0.75, 1]}
        >
          {({ top, height, mapX, mapY }) => (
            <>
              {chartData.flatMap((slot) =>
                slot.series.map((series, index) => (
                  <path
                    key={`${slot.acid.id}-${index}`}
                    d={buildLinePath(series, mapX, mapY)}
                    fill="none"
                    stroke={slot.color}
                    strokeWidth="2.6"
                    strokeDasharray={slot.dash}
                    opacity="0.86"
                  />
                ))
              )}
              <line x1={mapX(globalPH)} y1={top} x2={mapX(globalPH)} y2={top + height} stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.45" />
            </>
          )}
        </SvgChart>
      </CardContent>
    </Card>
  )
}
