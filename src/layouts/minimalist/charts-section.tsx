import { useTranslation } from "react-i18next"
import { useMemo, useRef, useEffect, useImperativeHandle, forwardRef } from "react"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { TitrationChart } from "@/features/chemistry/components/titration-chart"
import { buildSpeciationSeries } from "@/features/chemistry/lib/acid-math"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

// Mirror SvgChart geometry for speciation (xMax=14, yMax=1)
const SPEC_MAP_X = (v: number) => 56 + (v / 14) * 840
const SPEC_MAP_Y = (v: number) => 24 + 288 - v * 288

export type ChartsSectionHandle = {
  schedulePKaRaf: (slotIndex: number, pKaIndex: number, value: number) => void
}

type ChartsSectionProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
  onConcentrationChange: (slotIndex: number, isBase: boolean, value: number) => void
}

export const ChartsSection = forwardRef<ChartsSectionHandle, ChartsSectionProps>(
  function ChartsSection({ activeSlots, globalPH, locale, onConcentrationChange }, ref) {
    const { t } = useTranslation()

    // specPathRefs[slotIndex][speciesIndex] → <path> DOM element
    const specPathRefs = useRef<(SVGPathElement | null)[][]>([])
    // Live pKa values per slot – mutated by imperative RAF, never triggers renders
    const pKaLiveRef = useRef<number[][]>(activeSlots.map((s) => [...s.pKas]))
    const rafRef = useRef<number | null>(null)

    const slotIdsKey = activeSlots.map((s) => s.acid.id).join(",")

    // Re-sync live pKa values when acid selection changes
    useEffect(() => {
      pKaLiveRef.current = activeSlots.map((s) => [...s.pKas])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slotIdsKey])

    // Expose imperative method so parent can call it from AcidSlotsSection drag
    useImperativeHandle(ref, () => ({
      schedulePKaRaf(slotIndex, pKaIndex, value) {
        const live = pKaLiveRef.current[slotIndex]
        if (!live) return
        live[pKaIndex] = value
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          const paths = specPathRefs.current[slotIndex]
          if (!paths) return
          const series = buildSpeciationSeries(live)
          series.forEach((pts, i) => {
            paths[i]?.setAttribute("d", buildLinePath(pts, SPEC_MAP_X, SPEC_MAP_Y))
          })
        })
      },
    }))

    useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }, [])

    const speciationData = useMemo(
      () => activeSlots.map((slot) => ({ ...slot, series: buildSpeciationSeries(slot.pKas) })),
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
                  {speciationData.map((slot, slotIndex) =>
                    slot.series.map((series, speciesIndex) => (
                      <path
                        key={`${slot.acid.id}-${speciesIndex}`}
                        ref={(el) => { (specPathRefs.current[slotIndex] ??= [])[speciesIndex] = el }}
                        d={buildLinePath(series, mapX, mapY)}
                        fill="none" stroke={slot.color} strokeWidth="2"
                        strokeDasharray={slot.dash} opacity="0.8"
                      />
                    ))
                  )}
                  <line x1={mapX(globalPH)} y1={top} x2={mapX(globalPH)} y2={top + height}
                    stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                </>
              )}
            </SvgChart>
          </div>
        </div>

        <TitrationChart
          activeSlots={activeSlots}
          globalPH={globalPH}
          onConcentrationChange={onConcentrationChange}
        />
      </section>
    )
  }
)
