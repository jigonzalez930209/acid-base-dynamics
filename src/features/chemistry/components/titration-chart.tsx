import { useMemo, useState, useEffect, useRef, useCallback } from "react"

import { Beaker } from "lucide-react"
import { useTranslation } from "react-i18next"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buildTitrationSeries, calcTitrationVolume } from "@/features/chemistry/lib/acid-math"
import { TitrationChartControls } from "@/features/chemistry/components/titration-chart-controls"
import { TitrationEquivalenceTable } from "@/features/chemistry/components/titration-equivalence-table"
import type { ActiveSlot } from "@/features/chemistry/types/models"

const PAD_L = 56, PAD_T = 24
const MAP_IW = 920 - PAD_L - 24
const MAP_IH = 360 - PAD_T - 48
const rafMapX = (v: number) => PAD_L + (v / 350) * MAP_IW
const rafMapY = (v: number) => PAD_T + MAP_IH - (v / 14) * MAP_IH

type TitrationChartProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
  onConcentrationChange: (slotIndex: number, isBase: boolean, value: number) => void
}

export function TitrationChart({ activeSlots, globalPH, onConcentrationChange }: TitrationChartProps) {
  const { t } = useTranslation()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const concRef = useRef(
    activeSlots.map((s) => ({ CA: s.concentrationCA, CB: s.concentrationCB }))
  )
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const pathDRef = useRef<string[]>([])
  const circleRefs = useRef<(SVGCircleElement | null)[]>([])
  const caLabelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const cbLabelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rafRef = useRef<number | null>(null)

  const slotIdsKey = activeSlots.map((s) => s.acid.id).join(",")

  useEffect(() => {
    concRef.current = activeSlots.map((s) => ({ CA: s.concentrationCA, CB: s.concentrationCB }))
  }, [activeSlots])

  const initialPaths = useMemo(() => {
    return activeSlots.map((slot, i) => {
      const c = concRef.current[i] ?? { CA: slot.concentrationCA, CB: slot.concentrationCB }
      const d = buildLinePath(buildTitrationSeries(slot.pKas, c.CA, c.CB), rafMapX, rafMapY)
      pathDRef.current[i] = d
      return d
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey])

  const scheduleRaf = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      let circleIdx = 0
      activeSlots.forEach((slot, i) => {
        const el = pathRefs.current[i]
        const { CA, CB } = concRef.current[i] ?? { CA: slot.concentrationCA, CB: slot.concentrationCB }
        if (el) {
          const d = buildLinePath(buildTitrationSeries(slot.pKas, CA, CB), rafMapX, rafMapY)
          pathDRef.current[i] = d
          el.setAttribute("d", d)
        }
        slot.pKas.forEach((pKa) => {
          const vol = calcTitrationVolume(pKa, slot.pKas, CA, 100, CB)
          const circleEl = circleRefs.current[circleIdx]
          if (circleEl) {
            if (vol >= 0 && vol <= 350) {
              circleEl.setAttribute("cx", String(rafMapX(vol)))
              circleEl.setAttribute("visibility", "visible")
            } else {
              circleEl.setAttribute("visibility", "hidden")
            }
          }
          circleIdx++
        })
      })
    })
  }, [activeSlots])

  const handleConc = useCallback((slotIndex: number, isBase: boolean, value: number) => {
    const cur = concRef.current[slotIndex]
    if (!cur) return
    concRef.current[slotIndex] = isBase ? { ...cur, CB: value } : { ...cur, CA: value }
    const labelEl = isBase ? cbLabelRefs.current[slotIndex] : caLabelRefs.current[slotIndex]
    if (labelEl) labelEl.textContent = `${value.toFixed(2)} M`
    scheduleRaf()
  }, [scheduleRaf])

  const handleConcCommit = useCallback((slotIndex: number, isBase: boolean, value: number) => {
    onConcentrationChange(slotIndex, isBase, value)
  }, [onConcentrationChange])

  const equivalencePoints = useMemo(() => {
    const pts: Array<{ slotIndex: number; pKa: number; volume: number; color: string; name: string }> = []
    activeSlots.forEach((slot, i) => {
      const { CA, CB } = concRef.current[i] ?? { CA: slot.concentrationCA, CB: slot.concentrationCB }
      slot.pKas.forEach((pKa) => {
        const vol = calcTitrationVolume(pKa, slot.pKas, CA, 100, CB)
        if (vol >= 0 && vol <= 350)
          pts.push({ slotIndex: i, pKa, volume: vol, color: slot.color, name: slot.acid.names["en"] })
      })
    })
    return pts
  }, [activeSlots])

  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }, [])

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Beaker className="size-5 text-primary" />
          {t("charts.titrationTitle")}
        </CardTitle>
        <CardDescription>{t("charts.titrationDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3 md:px-4 md:pb-4 text-foreground">
        <TitrationChartControls
          activeSlots={activeSlots}
          slotIdsKey={slotIdsKey}
          caLabelRefs={caLabelRefs}
          cbLabelRefs={cbLabelRefs}
          onConcentrationChange={handleConc}
          onConcentrationCommit={handleConcCommit}
        />

        <SvgChart
          xLabel={t("charts.xVolume")}
          yLabel={t("charts.yPh")}
          xMin={0} xMax={350} yMin={0} yMax={14}
          xTicks={[0, 50, 100, 150, 200, 250, 300, 350]}
          yTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
        >
          {({ left, width, mapX, mapY }) => (
            <>
              {activeSlots.map((slot, i) => (
                <path
                  key={slot.acid.id}
                  ref={(el) => { pathRefs.current[i] = el }}
                  d={pathDRef.current[i] ?? initialPaths[i] ?? ""}
                  fill="none"
                  stroke={slot.color}
                  strokeWidth="3"
                  strokeDasharray={slot.dash}
                />
              ))}
              <line
                x1={left} y1={mapY(globalPH)}
                x2={left + width} y2={mapY(globalPH)}
                stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.45"
              />
              {equivalencePoints.map((pt, i) => (
                <circle
                  key={`eq-${i}`}
                  ref={(el) => { circleRefs.current[i] = el }}
                  cx={mapX(pt.volume)}
                  cy={mapY(pt.pKa)}
                  r={hoveredIdx === i ? 6 : 4}
                  fill={pt.color}
                  opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.35}
                  style={{ cursor: "pointer", transition: "r 0.1s, opacity 0.15s" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
            </>
          )}
        </SvgChart>
        <TitrationEquivalenceTable
          equivalencePoints={equivalencePoints}
          hoveredIdx={hoveredIdx}
          onHoverChange={setHoveredIdx}
        />
      </CardContent>
    </Card>
  )
}
