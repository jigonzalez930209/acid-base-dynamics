import { useMemo, useState, useEffect, useRef, useCallback } from "react"

import { Beaker } from "lucide-react"
import { useTranslation } from "react-i18next"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { buildTitrationSeries, calcTitrationVolume } from "@/features/chemistry/lib/acid-math"
import type { ActiveSlot } from "@/features/chemistry/types/models"

// ── Static coordinate mappers ─────────────────────────────────────────────────
// Mirror SvgChart's internal geometry (width=920, height=360, padding l=56 t=24 r=24 b=48).
// Module-level so RAF closures never re-capture them.
const PAD_L = 56, PAD_T = 24
const MAP_IW = 920 - PAD_L - 24  // 840
const MAP_IH = 360 - PAD_T - 48  // 288
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

  // ── Refs: never trigger React re-renders ─────────────────────────────────
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

  // Reset concentration refs when the acid selection itself changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    concRef.current = activeSlots.map((s) => ({ CA: s.concentrationCA, CB: s.concentrationCB }))
  }, [slotIdsKey])

  // Initial path strings for React's first render – acid-change only
  const initialPaths = useMemo(() => {
    return activeSlots.map((slot, i) => {
      const c = concRef.current[i] ?? { CA: slot.concentrationCA, CB: slot.concentrationCB }
      const d = buildLinePath(buildTitrationSeries(slot.pKas, c.CA, c.CB), rafMapX, rafMapY)
      pathDRef.current[i] = d
      return d
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotIdsKey])

  // ── Imperative RAF paint ──────────────────────────────────────────────────
  const scheduleRaf = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      // Track which circle index we're writing to (circles are flat across all slots)
      let circleIdx = 0
      activeSlots.forEach((slot, i) => {
        const el = pathRefs.current[i]
        const { CA, CB } = concRef.current[i] ?? { CA: slot.concentrationCA, CB: slot.concentrationCB }
        // Update curve path
        if (el) {
          const d = buildLinePath(buildTitrationSeries(slot.pKas, CA, CB), rafMapX, rafMapY)
          pathDRef.current[i] = d
          el.setAttribute("d", d)
        }
        // Update equivalence point circles for this slot (same frame)
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

  // Drag: mutate ref + update label text + schedule RAF. Zero state changes.
  const handleConc = useCallback((slotIndex: number, isBase: boolean, value: number) => {
    const cur = concRef.current[slotIndex]
    if (!cur) return
    concRef.current[slotIndex] = isBase ? { ...cur, CB: value } : { ...cur, CA: value }
    const labelEl = isBase ? cbLabelRefs.current[slotIndex] : caLabelRefs.current[slotIndex]
    if (labelEl) labelEl.textContent = `${value.toFixed(2)} M`
    scheduleRaf()
  }, [scheduleRaf])

  // Release: notify parent (single re-render at end of drag)
  const handleConcCommit = useCallback((slotIndex: number, isBase: boolean, value: number) => {
    onConcentrationChange(slotIndex, isBase, value)
  }, [onConcentrationChange])

  // Equivalence points update only when acids change (on parent re-render after commit)
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

        {/* Sliders – uncontrolled (defaultValue). key={slotIdsKey} remounts on acid change. */}
        {activeSlots.length > 0 && (
          <div key={slotIdsKey} className="mb-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("charts.concentrations")}
            </p>
            {activeSlots.map((slot, slotIndex) => (
              <div key={slot.acid.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slot.color }} />
                  <span className="text-sm font-medium">{slot.acid.names["en"]}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("charts.analyte")}</span>
                      <span ref={(el) => { caLabelRefs.current[slotIndex] = el }}
                        className="font-mono text-xs tabular-nums">
                        {slot.concentrationCA.toFixed(2)} M
                      </span>
                    </div>
                    <Slider
                      defaultValue={[slot.concentrationCA]}
                      onValueChange={(v) => handleConc(slotIndex, false, v[0])}
                      onValueCommit={(v) => handleConcCommit(slotIndex, false, v[0])}
                      min={0.01} max={2} step={0.01}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("charts.titrant")}</span>
                      <span ref={(el) => { cbLabelRefs.current[slotIndex] = el }}
                        className="font-mono text-xs tabular-nums">
                        {slot.concentrationCB.toFixed(2)} M
                      </span>
                    </div>
                    <Slider
                      defaultValue={[slot.concentrationCB]}
                      onValueChange={(v) => handleConc(slotIndex, true, v[0])}
                      onValueCommit={(v) => handleConcCommit(slotIndex, true, v[0])}
                      min={0.01} max={2} step={0.01}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart – paths rendered once by React with initialPaths[i], then updated
            imperatively via RAF. pathDRef.current[i] stays current so any React
            re-render (hover, etc.) writes the right value back. */}
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

        {equivalencePoints.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("charts.equivalencePoints")}
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("charts.eqAcid")}</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">{t("charts.eqPka")}</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">{t("charts.eqVolume")}</th>
                  </tr>
                </thead>
                <tbody>
                  {equivalencePoints.map((pt, i) => (
                    <tr
                      key={`row-${i}`}
                      className="border-b last:border-0 transition-colors"
                      style={{ backgroundColor: hoveredIdx === i ? `${pt.color}18` : undefined }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: pt.color }} />
                          {pt.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center font-mono tabular-nums">{pt.pKa.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center font-mono tabular-nums">{pt.volume.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
