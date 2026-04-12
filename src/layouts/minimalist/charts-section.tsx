import { useMemo } from "react"

import { useTranslation } from "react-i18next"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { buildSpeciationSeries, buildTitrationSeries } from "@/features/chemistry/lib/acid-math"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type ChartsSectionProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
}

export function ChartsSection({ activeSlots, globalPH, locale }: ChartsSectionProps) {
  const { t } = useTranslation()

  const speciationData = useMemo(
    () => activeSlots.map((slot) => ({ ...slot, series: buildSpeciationSeries(slot.pKas) })),
    [activeSlots]
  )
  const titrationData = useMemo(
    () => activeSlots.map((slot) => ({ ...slot, series: buildTitrationSeries(slot.pKas) })),
    [activeSlots]
  )

  return (
    <section className="mb-12 space-y-10">
      {activeSlots.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {activeSlots.map((slot) => (
            <div key={slot.acid.id} className="flex items-center gap-1.5">
              <svg width="16" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="16" y2="3" stroke={slot.color} strokeWidth="2" strokeDasharray={slot.dash} />
              </svg>
              <span>{slot.acid.names[locale]}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-1 text-lg font-light text-foreground">{t("charts.speciationTitle")}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{t("charts.speciationDescription")}</p>
        <div className="text-foreground">
          <SvgChart xLabel={t("charts.xPh")} yLabel={t("charts.yAlpha")}
            xMin={0} xMax={14} yMin={0} yMax={1}
            xTicks={[0, 2, 4, 6, 8, 10, 12, 14]} yTicks={[0, 0.25, 0.5, 0.75, 1]}>
            {({ top, height, mapX, mapY }) => (
              <>
                {speciationData.flatMap((slot) =>
                  slot.series.map((series, i) => (
                    <path key={`${slot.acid.id}-${i}`} d={buildLinePath(series, mapX, mapY)}
                      fill="none" stroke={slot.color} strokeWidth="2" strokeDasharray={slot.dash} opacity="0.8" />
                  ))
                )}
                <line x1={mapX(globalPH)} y1={top} x2={mapX(globalPH)} y2={top + height}
                  stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
              </>
            )}
          </SvgChart>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-light text-foreground">{t("charts.titrationTitle")}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{t("charts.titrationDescription")}</p>
        <div className="text-foreground">
          <SvgChart xLabel={t("charts.xVolume")} yLabel={t("charts.yPh")}
            xMin={0} xMax={350} yMin={0} yMax={14}
            xTicks={[0, 50, 100, 150, 200, 250, 300, 350]} yTicks={[0, 2, 4, 6, 8, 10, 12, 14]}>
            {({ left, width, mapX, mapY }) => (
              <>
                {titrationData.map((slot) => (
                  <g key={slot.acid.id}>
                    <path d={buildLinePath(slot.series, mapX, mapY)} fill="none"
                      stroke={slot.color} strokeWidth="2" strokeDasharray={slot.dash} />
                    {slot.pKas.map((pKa, i) => (
                      <line key={`${slot.acid.id}-${i}`}
                        x1={left} y1={mapY(pKa)} x2={left + width} y2={mapY(pKa)}
                        stroke={slot.color} strokeDasharray="3 5" strokeWidth="1" opacity="0.2" />
                    ))}
                  </g>
                ))}
                <line x1={left} y1={mapY(globalPH)} x2={left + width} y2={mapY(globalPH)}
                  stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
              </>
            )}
          </SvgChart>
        </div>
      </div>
    </section>
  )
}
